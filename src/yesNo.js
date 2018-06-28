import yesno from 'yesno'

function ask(question) {
  return new Promise(resolve => {
    yesno.ask(`${question} [Y/n]`, true, ok => {
      resolve(ok)
    })
  })
}

export default { ask }
