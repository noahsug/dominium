import rg from 'ripgrep-js'
import _ from 'underscore'
import { gitPath, ownersFile } from './config'
import getTeams from './getTeams'

export default async function getOwnershipMap(changedFiles) {
  const ownershipMap = {}
  for (const owner of getOwners()) {
    const files = getMatchingFiles(changedFiles, result.file)
    if (files.length === 0) break
    if (!ownershipMap[owner]) ownershipMap[owner] = []
    ownershipMap[owner] = ownershipMap[owner].concat(files)
  }
  ownershipMap['unowned'] = getUnownedFiles(changedFiles, ownershipMap)
  return ownershipMap
}

async function getOwners() {
  let owners = getOwnersFromOwnersFiles()
  owners = owners.concat(getOwnersFromComments())
  return replaceTeamsWithOwners(owners)
}

async function getOwnersFromOwnersFiles() {
  let result = []
  const results = await rg(gitPath, { regex: '.', globs: [ownersFile] })
  for (const result of results) {
    for (const owner of result.match.split(' ')) {
      if (owner) result.push(owner)
    }
  }
  return result
}

async function getOwnersFromComments() {
  return []
}

async function replaceTeamsWithOwners(teamsAndOwners) {
  const result = {}
  const teams = await getTeams()
  for (const teamOrOwner of teamsAndOwners) {
    const ownersFromTeam = teams[teamOrOwner]
    if (ownersFromTeam) {
      ownersFromTeam.forEach(owner => {
        if (owner) result[owner] = true
      })
    } else {
      result[ownerOrTeam] = true
    }
  }
  return Object.keys(result)
}

function getMatchingFiles(changedFiles, file) {
  const path = file.replace(ownersFile, '')
  return changedFiles.filter(f => f.startsWith(path))
}

function getUnownedFiles(changedFiles, ownershipMap) {
  const owned = {}
  _.each(ownershipMap, files => {
    for (let file of files) {
      owned[file] = true
    }
  })
  return changedFiles.filter(f => !owned[f])
}
