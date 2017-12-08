const EventEmitter = require('events')

const parsers = {
  cheerio: require('./parsers/Cheerio'),
  puppeteer: require('./parsers/Puppeteer'),
  osmosis: require('./parsers/Osmosis')
}

module.exports = class Crawler extends EventEmitter {
  constructor (options) {
    super()
    const emit = this.emit.bind(this)

    options = {
      parser: 'cheerio',
      concurrency: 10,
      rateLimit: false,
      retries: 5,
      retryInterval: 1000, // 1s
      backoff: 2,
      log: false,
      ...options,
      emit
    }

    const Parser = parsers[options.parser]
    if (!Parser) {
      throw new Error('Parser inválido')
    }

    this.parser = new Parser(options)
  }

  async once (callback) {
    return this.parser.once(callback)
  }

  async each (data, callback) {
    return this.parser.each(data, callback)
  }
}
