import rg from 'ripgrep-js'

function findFiles(dir, fileGlob) {
  return rg(dir, { regex: '.', globs: [fileGlob] }).catch(e => {
    checkRgInstalled(e)
    checkInvalidFileGlob(e, fileGlob)
    throw e
  })
}

function checkRgInstalled(e) {
  if (!e.stderr.includes('rg: command not found')) return
  throw new Error(
    'ripgrep not installed, please install from https://github.com/BurntSushi/ripgrep#installation'
  )
}

function checkInvalidFileGlob(e, fileGlob) {
  if (!e.stderr.includes('No files were searched')) return
  throw new Error(`no files matching "${fileGlob}", specify via --owners-file`)
}

export default { findFiles }
