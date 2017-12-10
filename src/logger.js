const crypto = require('crypto')
const perfy = require('perfy')

module.exports = class Logger {
  constructor () {
    this.successes = []
    this.errors = []
    this.totalTimer = {}
  }

  startTimer (name) {
    const random = crypto.randomBytes(3).toString('hex')
    const id = name || random
    perfy.start(id)
    return id
  }

  stopTimer (id) {
    return perfy.end(id)
  }

  setTotalTimer (totalTimer) {
    this.totalTimer = totalTimer
  }

  printTimer (timer, funcname = 'jcrawler') {
    console.log(`${funcname}_${timer.summary}`)
    perfy.destroy(timer.name)
  }

  success (name, timer, data) {
    this.successes.push({ name, timer, data })
  }

  error (name, timer, data) {
    this.errors.push({ name, timer, data })
  }

  results () {
    return {
      successes: this.successes,
      errors: this.errors,
      totalTimer: this.totalTimer
    }
  }

  print () {
    console.log(`\n> ${this.totalTimer.summary}`)

    if (this.successes.length > 0) {
      console.log('\n> SUCCESS:')
      this.successes.forEach((s, index) => console.log(`  ${s.name}_${s.timer.summary}`))
      console.log()
    }

    if (this.errors.length > 0) {
      console.log('\n> ERROR:')
      this.errors.forEach((e, index) => console.log(`  ${e.name}_${e.timer.summary}`))
    }
  }
}
