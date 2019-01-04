/* global document */

const express = require('express');
const functions = require('firebase-functions');
// const mime = require('mime');
const puppeteer = require('puppeteer');

const PostsHandler = require('./posts-handler');
let posts = new PostsHandler();

const app = express();
app.use(function cors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  // res.header('Content-Type', 'application/json;charset=utf-8');
  // res.header('Cache-Control', 'private, max-age=300');
  next();
});

// Init code that gets run before all request handlers.
app.all('*', async (req, res, next) => {
  res.locals.browser = await puppeteer.launch({args: ['--no-sandbox']});
  next(); // pass control on to router.
});

app.get('/render', async function renderHandler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send(
      'Please provide a URL. Example: ?url=https://example.com');
  }

  const browser = res.locals.browser;

  try {
    const page = await browser.newPage();
    const response = await page.goto(url, {waitUntil: 'networkidle2'});

    // Inject <base> on page to relative resources load properly.
    await page.evaluate(url => {
      const base = document.createElement('base');
      base.href = url;
      document.head.prepend(base); // Add to top of head, before all other resources.
    }, url);

    // Remove scripts and html imports. They've already executed.
    await page.evaluate(() => {
      const elements = document.querySelectorAll('script, link[rel="import"]');
      elements.forEach(e => e.remove());
    });

    const html = await page.content();
    // await page.close();

    res.status(response.status).send(html);
  } catch (e) {
    res.status(500).send(e.toString());
  }

  await browser.close();
});

app.get('/screenshot', async function screenshotHandler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send(
      'Please provide a URL. Example: ?url=https://example.com');
  }

  const viewport = {
    width: 1280,
    height: 1024,
    deviceScaleFactor: 1
  };

  let fullPage = false;
  const size = req.query.size;
  if (size) {
    const [width, height] = size.split(',').map(item => Number(item));
    if (!(isFinite(width) && isFinite(height))) {
      return res.status(400).send('Malformed size parameter. Example: ?size=800,600');
    }
    viewport.width = width;
    viewport.height = height;
  } else {
    fullPage = true;
  }

  const browser = res.locals.browser;

  try {
    const page = await browser.newPage();

    await page.goto(url, {waitUntil: 'networkidle2'});

    const opts = {
      fullPage,
      clip: {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      }
    };
    if (fullPage) {
      delete opts.clip;
    }

    const buffer = await page.screenshot(opts);

    res.type('image/png').send(buffer);
  } catch (e) {
    res.status(500).send(e.toString());
  }

  await browser.close();
});

app.get('/posts', posts.getPosts);

app.get('/version', async function versionHandler(req, res) {
  const browser = res.locals.browser;
  res.status(200).send(await browser.version());
  await browser.close();
});

const beefyOpts = {memory: '2GB', timeoutSeconds: 60};
exports.screenshot = functions.runWith(beefyOpts).https.onRequest(app);
exports.render = functions.runWith(beefyOpts).https.onRequest(app);

exports.version = functions.https.onRequest(app);
exports.posts = functions.runWith(beefyOpts).https.onRequest(app);