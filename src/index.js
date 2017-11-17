#!/usr/bin/env node

import _ from 'underscore'
import git from './git'
import config from './config'
import getOwnerMap from './getOwnerMap'
import getPullRequests from './getPullRequests'
import teams from './teams'
import yesNo from './yesNo'

async function run() {
  await git.init()
  const changedFiles = await git.getChangedFiles()
  const ownerMap = await getOwnerMap(changedFiles)
  await teams.replaceTeamsWithOwners(ownerMap)
  const pullRequests = getPullRequests(ownerMap)
  await teams.replaceOwnersWithTeams(pullRequests)
  printBranches(pullRequests)
  if (await yesNo.ask('\nProceed?')) {
    await createBranches(pullRequests)
    await git.checkoutOriginalBranch()
  }
  process.exit(1)
}

function printBranches(pullRequests) {
  console.log('Splitting code into', pullRequests.length, 'branches:\n')
  _.each(pullRequests, (pr, index) => {
    console.log(
      `  [${git.getBranchName(getBranchSuffix(index))}]`,
      `${pr.files.length} files`,
      `owned by ${pr.owners.join(', ')}`
    )
  })
}

async function createBranches(pullRequests) {
  console.log('')
  for (const [i, pr] of pullRequests.entries()) {
    const branchSuffix = getBranchSuffix(i)
    const commitMsgSuffix = `${i + 1}/${pullRequests.length}`
    console.log('Creating branch', git.getBranchName(branchSuffix))
    await git.createPrBranch(pr, { branchSuffix, commitMsgSuffix })
  }
  console.log('\nDone')
}

function getBranchSuffix(index) {
  return index + 1
}

run()

//import getTeamMembers from './getTeamMembers'
//async function run2() {
//  console.log(await getTeamMembers('mt-places'))
//}
//run2()
