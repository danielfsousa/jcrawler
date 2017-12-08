# jcrawler

Asynchronous control flow wrapper to crawl websites

## How to Install

```bash
  npm install jcrawler
```

## Usage

```javascript
  (async () => {
    const jcrawler = require('jcrawler')

    const crawler = jcrawler({
      parser: 'puppeteer', // puppeteer, cheerio or osmosis
      concurrency: 2,
      rateLimit: ms('1s'),
      retries: 5,
      retryInterval: ms('1s'),
      backoff: 2,
      log: true
    })

    crawler
      .on('data', data => console.log(data)) // events: each, once, data and error
      .on('error', err => console.error(err))

    const fruits = ['apple', 'banana', 'orange']

    const results = await crawler.each(fruits, async (fruit, page, browser) => { // using puppeteer
      await page.goto('http://google.com')
      await page.type("input[title='Search']", fruit)
      await page.click("input[value=\"I'm Feeling Lucky\"]")
      await page.screenshot({ path: `${fruit}.png`) })
    })
  })()
```

## License

[MIT License](README.md) - [Daniel Sousa](https://github.com/danielfsousa)
