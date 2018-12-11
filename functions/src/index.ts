import * as functions from 'firebase-functions';
import * as express from 'express';
import * as bodyParser from 'body-parser';

import * as puppeteer from 'puppeteer';

export const render = functions.runWith({ memory: '1GB' })

const app = express();
const main = express();

app.get('/posts', async (req, res) => {
  // Launch a browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Pass a URL via a query param
  const requestURL = 'http://i-proving.com/';

  // Visit the page a get content
  const page = await browser.newPage();

  await page.goto(requestURL, { waitUntil: 'networkidle0' })

  // const content = await page.content();

  const POST_SELECTOR = '.entry-title';

  let postTitles = await page.evaluate((sel) => {
    let result = [];
    document.querySelectorAll(sel).forEach((post) => postTitles.push(post.innerText));
    
    return result;
  }, POST_SELECTOR);

  res.status(200).send(postTitles);
})

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));
// webApi is your functions name, and you will pass main as 
// a parameter
export const webApi = functions.https.onRequest(main);
