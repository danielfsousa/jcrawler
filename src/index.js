Promise = require('bluebird') // eslint-disable-line

const Crawler = require('./crawler')

module.exports = (...args) => new Crawler(...args)
