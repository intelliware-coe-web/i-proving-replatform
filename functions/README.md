# Puppeteer'ing and REST calls on Firebase Cloud Functions
[For more info.](https://medium.com/@ebidel/puppeteering-in-firebase-google-cloud-functions-76145c7662bd)

## How to add new endpoint
1. Create new endpoint in [index.js](index.js)
1. Create new export for new [endpoint](index.js#L153) (Note: If you don't need puppeteer for your endpoint you don't need beefopts)
1. Update [firebase.json](../firebase.json#L16) with rewrites

## How to test
1. Make sure you have `firebase-tools` [How to Install](https://firebase.google.com/docs/cli/)
1. `firebase serve`

## API
### Posts
`http://localhost:5000/posts`
