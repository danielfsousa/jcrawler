module.exports = class Logger {
  constructor () {
    this.success = []
    this.errors = []
  }

  startTimer () {
    console.time('jcrawler')
  }

  stopTimer () {
    console.timeEnd('jcrawler')
  }

  success (mensagem) {
    this.success.push(mensagem)
  }

  error (mensagem) {
    this.errors.push(mensagem)
  }

  print () {
    if (this.success.length > 0) {
      console.log('\n> SUCESSO:')
      this.success.forEach((sucesso, index) => console.log(`  ${index + 1}. ${sucesso}`))
      console.log()
    }

    if (this.errors.length > 0) {
      console.log('\n> ERRO:')
      this.errors.forEach((erro, index) => console.log(`  ${index + 1}. ${erro}`))
    }
  }
}
