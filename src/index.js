#!/usr/bin/env node

import git from './git'
import config from './config'
import getOwnerMap from './getOwnerMap'
import getPullRequests from './getPullRequests'
import teams from './teams'

async function run() {
  await git.init()
  const changedFiles = await git.getChangedFiles()
  const ownerMap = await getOwnerMap(changedFiles)
  await teams.replaceTeamsWithOwners(ownerMap)
  const pullRequests = getPullRequests(ownerMap)
  await teams.replaceOwnersWithTeams(pullRequests)
  await createBranches(pullRequests)
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

run()

//import getTeamMembers from './getTeamMembers'
//async function run2() {
//  console.log(await getTeamMembers('mt-places'))
//}
//run2()
