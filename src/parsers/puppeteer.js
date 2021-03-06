const Generic = require('./generic')
const retry = require('bluebird-retry')

module.exports = class Puppeteer extends Generic {
  constructor (options) {
    super(options)
    this.puppeteer = options.puppeteer
  }

  async once (callback) {
    let data
    let success
    this.callback = callback
    this.browser = await this.puppeteer.launch()
    const page = await this.browser.newPage()

    let timer
    const timerId = this.logger.startTimer()
    try {
      data = await this.callback(this.browser, page)
      success = true
      timer = this.logger.stopTimer(timerId)
      this.emit('data', data, timer)
    } catch (err) {
      timer = this.logger.stopTimer(timerId)
      this.emit('error', err, timer)
    }
    this.log && this.logger.printTimer(timer, callback.name)

    if (success) {
      this.logger.success(this.callback.name, timer, data)
    } else {
      this.logger.error(this.callback.name, timer, data)
    }

    this.logger.setTotalTimer(timer)
    const results = this.logger.results()
    this.emit('end', data, results)
    this.log && this.logger.print()

    await page.close()
    await this.browser.close()

    if (this.rateLimit) {
      await Promise.delay(this.rateLimit)
    }

    return data
  }

  async each (input, callback) {
    this.data = []
    this.callback = callback
    this.browser = await this.puppeteer.launch()

    this.logger.startTimer('TOTAL_TIMER')
    await Promise.map(input, d => this._crawl(d), { concurrency: this.concurrency })
    const totalTimer = this.logger.stopTimer('TOTAL_TIMER')
    this.logger.setTotalTimer(totalTimer)

    const results = this.logger.results()
    this.emit('end', this.data, results)
    this.log && this.logger.print()

    await this.browser.close()
    return this.data
  }

  async _crawl (input) {
    let success
    let data

    this.emit('each', input)
    const page = await this.browser.newPage()

    let timer
    const timerId = this.logger.startTimer()
    try {
      data = await retry(this.callback, {
        args: [this.browser, page, input],
        max_tries: this.retries,
        interval: this.retryInterval,
        backoff: this.backoff
      })
      success = true
      timer = this.logger.stopTimer(timerId)
      this.emit('data', data, input, timer)
      this.data.push(data)
    } catch (err) {
      timer = this.logger.stopTimer(timerId)
      this.emit('error', err, input, timer)
    }
    this.log && this.logger.printTimer(timer, this.callback.name)

    if (success) {
      this.logger.success(this.callback.name, timer, input)
    } else {
      this.logger.error(this.callback.name, timer, input)
    }

    await page.close()
    if (this.rateLimit) {
      await Promise.delay(this.rateLimit)
    }
  }
}
