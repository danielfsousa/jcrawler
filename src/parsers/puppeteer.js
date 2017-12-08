const puppeteer = require('puppeteer')
const Generic = require('./generic')
const retry = require('bluebird-retry')

module.exports = class Puppeteer extends Generic {
  constructor ({
    concurrency,
    rateLimit,
    retries,
    retryInterval,
    backoff,
    log,
    emit
  }) {
    super({
      parser: puppeteer,
      concurrency,
      rateLimit,
      retries,
      retryInterval,
      backoff,
      log,
      emit
    })
  }

  async once (callback) {
    let result
    this.callback = callback
    this.browser = await puppeteer.launch()

    const timerId = this.log && this.logger.startTimer()
    try {
      result = await this.callback(this.browser)
      this.emit('once', result)
      this.emit('data', result)
    } catch (err) {
      this.emit('error', err)
    }
    this.log && this.logger.stopTimer(timerId)

    await this.browser.close()
    return result
  }

  async each (data, callback) {
    this.results = []
    this.callback = callback
    this.browser = await puppeteer.launch()
    await Promise.map(data, d => this._crawl(d), { concurrency: this.concurrency })
    await this.browser.close()
    if (this.rateLimit) {
      await Promise.delay(this.rateLimit)
    }
    return this.results
  }

  async _crawl (data) {
    const page = await this.browser.newPage()

    const timerId = this.log && this.logger.startTimer()
    try {
      const result = await retry(this.callback, {
        args: [data, page, this.browser],
        max_tries: this.tries,
        interval: this.retryInterval,
        backoff: this.backoff
      })
      this.emit('each', result)
      this.emit('data', result)
      this.results.push(result)
    } catch (err) {
      this.emit('error', err)
    }
    this.log && this.logger.stopTimer(timerId)

    await page.close()
    if (this.rateLimit) {
      await Promise.delay(this.rateLimit)
    }
  }
}
