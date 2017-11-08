import rg from 'ripgrep-js'
import _ from 'underscore'
import { root, ownersFile } from './config'

export default async function getOwnershipMap(changedFiles) {
  const results = await rg(root, { regex: '.', globs: [ownersFile] })
  const ownershipMap = {}
  for (let result of results) {
    for (let owner of result.match.split(' ')) {
      if (!owner) break
      const files = getMatchingFiles(changedFiles, result.file)
      if (files.length === 0) break
      if (!ownershipMap[owner]) ownershipMap[owner] = []
      ownershipMap[owner] = ownershipMap[owner].concat(files)
    }
  }
  ownershipMap['unowned'] = getUnownedFiles(changedFiles, ownershipMap)
  return ownershipMap
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
