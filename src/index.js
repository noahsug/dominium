import git from './git'
import config from './config'
import getOwnershipMap from './getOwnershipMap'
import getPullRequests from './getPullRequests'
import getTeams from './getTeams'

async function run() {
  await git.init()
  const changedFiles = await git.getChangedFiles()
  const ownership = await getOwnershipMap(changedFiles)
  const pullRequests = getPullRequests(ownership)
  createBranches(pullRequests)
}

async function createBranches(pullRequests) {
  console.log('Creating', pullRequests.length, 'branches:')
  for (const [i, pr] of pullRequests.entries()) {
    printBranch(pr, i)
    const options = {
      branchSuffix: i + 1,
      commitMsgSuffix: `${i + 1}/${pullRequests.length}`,
    }
    if (!config.dryRun) await git.createPrBranch(pr, options)
  }
}

function printBranch(pr, index) {
  console.log(
    `  ${index + 1})`,
    `${pr.files.length} files`,
    `owned by ${pr.owners.join(', ')}`
  )
}

// run()

async function run2() {
  console.log('getting teams...')
  const teams = await getTeams()
  console.log('TEAMS:', teams)
}

run2()
