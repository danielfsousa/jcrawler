const osmosis = require('cheerio')
const Generic = require('./generic')

module.exports = class Osmosis extends Generic {
  constructor ({ retries, concurrency, rateLimit, log, emit }) {
    super({
      parser: osmosis,
      concurrency,
      rateLimit,
      retries,
      log,
      emit
    })
  }
}
