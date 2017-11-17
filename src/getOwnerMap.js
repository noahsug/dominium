import rg from 'ripgrep-js'
import _ from 'underscore'
import { appendObjValues } from './utils'
import { gitPath, ownerFileName, noOwnerBranchSuffix } from './config'

export default async function getOwnerMap(changedFiles) {
  const ownerMap = {}
  appendObjValues(ownerMap, await getOwnerMapFromOwnerFiles(changedFiles))
  appendObjValues(ownerMap, await getOwnerMapFromComments(changedFiles))
  ownerMap[noOwnerBranchSuffix] = getUnownedFiles(changedFiles, ownerMap)
  return ownerMap
}

async function getOwnerMapFromOwnerFiles(changedFiles) {
  const pathOwnerMap = await getOwnerFileOwnerMap()
  return getChangedFilesOwnerMap(pathOwnerMap, changedFiles)
}

async function getOwnerFileOwnerMap() {
  const ownerMap = {}
  const results = await rg(gitPath, { regex: '.', globs: [ownerFileName] })
  for (const result of results) {
    const owners = result.match
      .replace(/(\s|,)+/, ' ')
      .trim()
      .split(/\s/)
    const file = result.file.replace(ownerFileName, '')
    for (const owner of owners) {
      ownerMap[owner] = (ownerMap[owner] || []).concat(file)
    }
  }
  return ownerMap
}

async function getOwnerMapFromComments(changedFiles) {
  return {}
}

async function getChangedFilesOwnerMap(pathOwnerMap, changedFiles) {
  const ownerMap = {}
  _.each(pathOwnerMap, (paths, owner) => {
    const files = getMatchingFiles(changedFiles, paths)
    if (files.length === 0) return
    ownerMap[owner] = (ownerMap[owner] || []).concat(files)
  })
  return ownerMap
}

function getMatchingFiles(changedFiles, paths) {
  let files = []
  for (const path of paths) {
    const matchingFiles = changedFiles.filter(f => f.startsWith(path))
    files = files.concat(matchingFiles)
  }
  return files
}

function getUnownedFiles(changedFiles, ownerMap) {
  const owned = {}
  _.each(ownerMap, files => {
    for (let file of files) {
      owned[file] = true
    }
  })
  return changedFiles.filter(f => !owned[f])
}
