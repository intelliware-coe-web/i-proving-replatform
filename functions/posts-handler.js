class PostsHandler {

  async getPosts(req, res) {
    const browser = res.locals.browser;
    const page = await browser.newPage();
    
    try {
      if (req.query.postId) {

        const url = req.query.postId.replace(new RegExp('_', 'g'), '/');

        await page.goto(url, {waitUntil: 'networkidle2'});
    
        let post = await page.evaluate((sel) => {
          return document.querySelector(sel).innerHTML;
        }, '.entry-content')

        res.status(200).send(post);
      } else {
        await page.goto('http://i-proving.com/', {waitUntil: 'networkidle2'});

        let posts = await page.evaluate((sel) => {
          let result = [];
          document.querySelectorAll(sel).forEach((post) => {
            let postLink = post.getAttribute('href');
            let postId = postLink.replace(new RegExp('/', 'g'), '_');
    
            result.push({
              title: post.innerText,
              id: postId
            })
          });
          
          return result;
        }, '.entry-title a');
        
        res.status(200).send(posts);
      }
    } catch (e) {
      res.status(500).send(e.toString());
    }
  
    await browser.close();
  }
}

module.exports = PostsHandler;