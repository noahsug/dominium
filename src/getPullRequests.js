import _ from 'underscore'
import config from './config'
import { clone } from './utils'

export default function getPullRequests(ownerMap) {
  const unclaimedOwnerMap = clone(ownerMap)
  // Get PRs such that each is covered by at least two owners.
  const prs = getBestCoveragePrs(unclaimedOwnerMap)
  removeFiles(unclaimedOwnerMap, getFiles(prs))
  // Add files to existing PRs that are covered by an owner.
  addSingleOwnerCoveredFiles(prs, unclaimedOwnerMap)
  removeFiles(unclaimedOwnerMap, getFiles(prs))
  // Get remaining PRs.
  prs.push(...getAnyCoveragePrs(unclaimedOwnerMap))
  // Split PRs that are over the max file limit.
  splitPrsByMaxFileLimit(prs, ownerMap)

  return prs
}

function getBestCoveragePrs(ownerMap) {
  const prs = []
  const pairOwnerMap = getPairOwnerMap(ownerMap)
  let ownerPair = getBestOwner(pairOwnerMap)
  while (ownerPair) {
    const files = pairOwnerMap[ownerPair]
    if (files.length <= 1) break
    const owners = getOwners(files, ownerMap)
    prs.push({ owners, files })
    removeFiles(pairOwnerMap, files)
    ownerPair = getBestOwner(pairOwnerMap)
  }
  return prs
}

function getPairOwnerMap(ownerMap) {
  const pairOwnerMap = {}
  const ownerPairs = getOwnerPairs(Object.keys(ownerMap))
  ownerPairs.forEach(pair => {
    const files = _.intersection(ownerMap[pair[0]], ownerMap[pair[1]])
    pairOwnerMap[pair.join(',')] = files
  })
  return pairOwnerMap
}

function getOwnerPairs(owners) {
  let pairs = []
  for (let i = 0; i < owners.length; i++) {
    for (let j = i + 1; j < owners.length; j++) {
      pairs.push([owners[i], owners[j]])
    }
  }
  return pairs
}

function addSingleOwnerCoveredFiles(prs, ownerMap) {
  const ownersInPrs = _.unique(_.flatten(prs.map(pr => pr.owners)))
  const prOwnerMap = _.pick(ownerMap, ...ownersInPrs)
  let owner = getBestOwner(prOwnerMap)
  while (owner) {
    const pr = prs.find(pr => pr.owners.includes(owner))
    if (!pr) break // should never happen?
    pr.files = pr.files.concat(prOwnerMap[owner])
    removeFiles(prOwnerMap, prOwnerMap[owner])
    owner = getBestOwner(prOwnerMap)
  }
}

function getAnyCoveragePrs(ownerMap) {
  let prs = []
  let owner = getBestOwner(ownerMap)
  while (owner) {
    const files = ownerMap[owner]
    const owners = getOwners(files, ownerMap)
    prs.push({ owners, files })
    removeFiles(ownerMap, files)
    owner = getBestOwner(ownerMap)
  }
  return prs
}

function getBestOwner(ownerMap) {
  const owners = Object.keys(ownerMap)
  if (!owners.length) return null
  return _.max(owners, owner => ownerMap[owner].length)
}

function removeFiles(ownerMap, files) {
  const owners = Object.keys(ownerMap)
  owners.forEach(owner => {
    const remainingFiles = _.difference(ownerMap[owner], files)
    if (remainingFiles.length) {
      ownerMap[owner] = remainingFiles
    } else {
      delete ownerMap[owner]
    }
  })
}

function splitPrsByMaxFileLimit(prs, ownerMap) {
  for (let i = 0; i < prs.length; i++) {
    const pr = prs[i]
    if (pr.files.length <= config.maxFiles) continue
    const split = splitPr(pr, ownerMap)
    prs.splice(i, 1, ...split)
    i += split.length - 1
  }
}

function splitPr(pr, ownerMap) {
  const split = []
  const files = pr.files
  const numSplits = Math.ceil(files.length / config.maxFiles)
  const filesPerSplit = Math.round(config.maxFiles / numSplits)
  for (let i = 0; i < numSplits; i++) {
    const filesToAdd = files.slice(i * filesPerSplit, (i + 1) * filesPerSplit)
    const ownersToAdd = getOwners(filesToAdd, ownerMap)
    split.push({ files: filesToAdd, owners: ownersToAdd })
  }
  return split
}

function getOwners(files, ownerMap) {
  let owners = []
  _.each(ownerMap, (ownedFiles, owner) => {
    const coverFiles = files.every(f => ownedFiles.includes(f))
    if (coverFiles) owners.push(owner)
  })
  return owners
}

function getFiles(prs) {
  return _.unique(_.flatten(prs.map(pr => pr.files)))
}
