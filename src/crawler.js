const EventEmitter = require('events')

module.exports = class Crawler extends EventEmitter {
  constructor (options) {
    super()
    const emit = this.emit.bind(this)

    options = {
      puppeteer: false,
      concurrency: 10,
      rateLimit: false,
      retries: 5,
      retryInterval: 1000, // 1s
      backoff: 2,
      log: false,
      ...options,
      emit
    }

    const Parser = options.puppeteer
      ? require('./parsers/puppeteer')
      : require('./parsers/generic')

    this.parser = new Parser(options)
  }

  async once (callback) {
    return this.parser.once(callback)
  }

  async each (data, callback) {
    return this.parser.each(data, callback)
  }
}
