class PostsHandler {

  async getPosts(req, res) {
    const browser = res.locals.browser;
  
    const requestURL = 'http://i-proving.com/';
  
    try {
      const page = await browser.newPage();
  
      await page.goto(requestURL, {waitUntil: 'networkidle2'});
  
      const POST_SELECTOR = '.entry-title';
  
      let postTitles = await page.evaluate((sel) => {
        let result = [];
        document.querySelectorAll(sel).forEach((post) => result.push(post.innerText));
        
        return result;
      }, POST_SELECTOR);
  
      res.status(200).send(postTitles);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  
    await browser.close();
  }
}

module.exports = PostsHandler;