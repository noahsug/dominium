import git from 'simple-git'
import _ from 'underscore'
import { gitPath } from './config'

function getChangedFiles() {
  return new Promise(resolve => {
    git(gitPath).show(['--oneline', '--name-only'], (err, result) => {
      resolve(result.split('\n').slice(1, -1))
    })
  })
}

const gitInfo = {}

async function init() {
  Object.assign(gitInfo, await getGitInfo())
}

function getGitInfo() {
  const gitInfo = {}
  return new Promise(resolve => {
    git(gitPath)
      .raw(['log', '--oneline', '-2'], (err, result) => {
        const commits = result.split('\n')
        gitInfo.commits = {
          change: commits[0].split(' ')[0],
          base: commits[1].split(' ')[0],
        }
        gitInfo.commitMsg = commits[0]
          .split(' ')
          .slice(1)
          .join(' ')
      })
      .revparse(['--abbrev-ref', 'HEAD'], (err, result) => {
        gitInfo.branch = result.trim()
      })
      .exec(() => {
        resolve(gitInfo)
      })
  })
}

function createPrBranch(pr, { branchSuffix, commitMsgSuffix = '' }) {
  if (_.isEmpty(gitInfo)) throw new Error('git.init() never called')
  return new Promise(resolve => {
    git(gitPath)
      .checkoutBranch(`${gitInfo.branch}-${branchSuffix}`, gitInfo.commits.base)
      .checkout([gitInfo.commits.change, ...pr.files])
      .commit(`${gitInfo.commitMsg} ${commitMsgSuffix}`)
      .exec(resolve)
  })
}

export default { getChangedFiles, createPrBranch, init }
