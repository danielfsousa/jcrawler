const retry = require('bluebird-retry')
const Logger = require('./logger')

module.exports = class Generic {
  constructor ({
    parser,
    concurrency,
    rateLimit,
    retries,
    retryInterval,
    backoff,
    log,
    emit
  }) {
    this.parser = parser
    this.concurrency = concurrency
    this.rateLimit = rateLimit
    this.retries = retries
    this.retryInterval = retryInterval
    this.backoff = backoff
    this.log = log
    this.emit = emit
    this.logger = new Logger()
  }

  async once (callback) {
    let result
    this.callback = callback

    this.log && this.logger.startTimer()
    try {
      result = await this.callback(this.parser)
      this.emit('once', result)
      this.emit('data', result)
    } catch (err) {
      this.emit('error', err)
    }
    this.log && this.logger.stopTimer()

    if (this.rateLimit) {
      await Promise.delay(this.rateLimit)
    }

    return result
  }

  async each (data, callback) {
    this.results = []
    this.callback = callback
    await Promise.map(data, d => this._crawl(d), { concurrency: this.concurrency })
    return this.results
  }

  async _crawl (data) {
    try {
      const result = await retry(this.callback, {
        args: [data, this.parser],
        max_tries: this.retries,
        interval: this.retryInterval,
        backoff: this.backoff
      })
      this.emit('each', result)
      this.emit('data', result)
      this.results.push(result)
    } catch (err) {
      this.emit('error', err)
    }
    if (this.rateLimit) {
      await Promise.delay(this.rateLimit)
    }
  }
}
