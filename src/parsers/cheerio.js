const cheerio = require('cheerio')
const Generic = require('./generic')

module.exports = class Cheerio extends Generic {
  constructor ({ retries, concurrency, rateLimit, emit }) {
    super({
      parser: cheerio,
      concurrency,
      rateLimit,
      retries,
      emit
    })
  }
}
