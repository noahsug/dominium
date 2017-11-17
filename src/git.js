import git from 'simple-git'
import _ from 'underscore'
import { gitPath } from './config'
import { checkError } from './utils'

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
        checkError(err)
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
        checkError(err)
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
    git(gitPath)
      .checkoutBranch(
        getBranchName(branchSuffix),
        gitInfo.commits.base,
        checkError
      )
      .checkout([gitInfo.commits.change, ...pr.files], checkError)
      .commit(`${gitInfo.commitMsg} ${commitMsgSuffix}`, checkError)
      .exec(resolve)
  })
}

function getBranchName(suffix) {
  return `${gitInfo.branch}-${suffix}`
}

async function checkoutOriginalBranch() {
  checkGitInitCalled()
  return new Promise(resolve => {
    git(gitPath)
      .checkout(gitInfo.branch, checkError)
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
