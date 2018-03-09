import git from 'simple-git'
import _ from 'underscore'
import config from './config'
import { logError } from './utils'

function getChangedFiles() {
  return new Promise(resolve => {
    git(config.gitPath).show(['--oneline', '--name-only'], (err, result) => {
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
    git(config.gitPath)
      .raw(['log', '--oneline', '-2'], (err, result) => {
        logError(err)
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
        logError(err)
        gitInfo.branch = result.trim()
      })
      .exec(() => {
        resolve(gitInfo)
      })
  })
}

function createPrBranch(pr, { branchSuffix, commitMsgSuffix = '' }) {
  checkGitInitCalled()
  return new Promise(resolve => {
    git(config.gitPath)
      .checkoutBranch(
        getBranchName(branchSuffix),
        gitInfo.commits.base,
        logError
      )
      .checkout([gitInfo.commits.change, ...pr.files], logError)
      .commit(`${gitInfo.commitMsg} ${commitMsgSuffix}`, logError)
      .exec(resolve)
  })
}

function getBranchName(suffix) {
  return `${gitInfo.branch}-${suffix}`
}

async function checkoutOriginalBranch() {
  checkGitInitCalled()
  return new Promise(resolve => {
    git(config.gitPath)
      .checkout(gitInfo.branch, logError)
      .exec(resolve)
  })
}

function checkGitInitCalled() {
  if (_.isEmpty(gitInfo)) throw new Error('git.init() never called')
}

export default {
  getChangedFiles,
  getBranchName,
  checkoutOriginalBranch,
  createPrBranch,
  init,
}
