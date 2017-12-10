const osmosis = require('cheerio')
const Generic = require('./generic')

module.exports = class Osmosis extends Generic {
  constructor (options) {
    super({
      parser: osmosis,
      ...options
    })
  }
}
