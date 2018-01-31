const retry = require('bluebird-retry')
const Logger = require('../logger')

module.exports = class Generic {
  constructor (options) {
    this.concurrency = options.concurrency
    this.rateLimit = options.rateLimit
    this.retries = options.retries
    this.retryInterval = options.retryInterval
    this.backoff = options.backoff
    this.log = options.log
    this.emit = options.emit
    this.logger = new Logger()
  }

  async once (callback) {
    let success
    let data
    this.callback = callback

    let timer
    const timerId = this.logger.startTimer()
    try {
      data = await callback()
      success = true
      timer = this.logger.stopTimer(timerId)
      this.emit('data', data, timer)
    } catch (err) {
      timer = this.logger.stopTimer(timerId)
      this.emit('error', err, timer)
    }
    this.log && this.logger.printTimer(timer, callback.name)

    if (success) {
      this.logger.success(callback.name, timer, data)
    } else {
      this.logger.error(callback.name, timer, data)
    }

    this.logger.setTotalTimer(timer)
    const results = this.logger.results()
    this.emit('end', data, results)
    this.log && this.logger.print()

    if (this.rateLimit) {
      await Promise.delay(this.rateLimit)
    }

    return data
  }

  async each (data, callback) {
    this.results = []
    this.callback = callback

    this.logger.startTimer('TOTAL_TIMER')
    await Promise.map(data, d => this._crawl(d), { concurrency: this.concurrency })
    const totalTimer = this.logger.stopTimer('TOTAL_TIMER')
    this.logger.setTotalTimer(totalTimer)
    
    const results = this.logger.results()
    this.emit('end', this.data, results)
    this.log && this.logger.print()

    return this.results
  }

  async _crawl (input) {
    let success
    let data

    this.emit('each', input)
    let timer
    const timerId = this.logger.startTimer()
    try {
      data = await retry(this.callback, {
        args: [input],
        max_tries: this.retries,
        interval: this.retryInterval,
        backoff: this.backoff
      })
      success = true
      timer = this.logger.stopTimer(timerId)
      this.emit('data', data, input, timer)
      this.results.push(data)
    } catch (err) {
      timer = this.logger.stopTimer(timerId)
      this.emit('error', err, input, timer)
    }
    this.log && this.logger.printTimer(timer, this.callback.name)

    if (success) {
      this.logger.success(this.callback.name, timer)
    } else {
      this.logger.error(this.callback.name, timer)
    }

    if (this.rateLimit) {
      await Promise.delay(this.rateLimit)
    }
  }
}
