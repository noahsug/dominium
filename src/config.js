const config = {
  ownersFileName: 'MANDATORY_REVIEWERS',
  maxFiles: Infinity,
  gitPath: undefined,
}

function setConfig(options) {
  Object.keys(config).forEach(key => {
    if (options[key] === undefined) return
    config[key] = options[key]
  })
}

function checkConfig() {
  if (!config.gitPath) throw new Error('git path not specified')
}

export { setConfig, checkConfig }
export default config
