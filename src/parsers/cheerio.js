const cheerio = require('cheerio')
const Generic = require('./generic')

module.exports = class Cheerio extends Generic {
  constructor (options) {
    super({
      parser: cheerio,
      ...options
    })
  }
}
