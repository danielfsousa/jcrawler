Promise = require('bluebird') // eslint-disable-line

const Crawler = require('./Crawler')

module.exports = (...args) => new Crawler(...args)
