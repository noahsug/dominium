import yesno from 'yesno'

function ask(question) {
  return new Promise(resolve => {
    yesno.ask(`${question} [Y/n]`, false, ok => {
      resolve(ok)
    })
  })
}

export default { ask }
