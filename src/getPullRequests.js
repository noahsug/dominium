import _ from 'underscore'

export default function getPullRequests(ownerMap) {
  let prs = getBestCoveragePrs(ownerMap)
  removeFiles(ownerMap, getFiles(prs))
  addSingleOwnerCoveredFiles(prs, ownerMap)
  removeFiles(ownerMap, getFiles(prs))
  return prs.concat(getAnyCoveragePrs(ownerMap))
}

function getBestCoveragePrs(ownerMap) {
  const prs = []
  const pairOwnerMap = getPairOwnerMap(ownerMap)
  let ownerPair = getBestOwner(pairOwnerMap)
  while (ownerPair) {
    const files = pairOwnerMap[ownerPair]
    if (files.length === 1) break
    const owners = getOwners(ownerMap, files)
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
  const prOwnerOwnerMap = _.pick(ownerMap, ...ownersInPrs)
  let owner = getBestOwner(prOwnerOwnerMap)
  while (owner) {
    const pr = prs.find(pr => pr.owners.includes(owner))
    if (!pr) break
    pr.files = pr.files.concat(prOwnerOwnerMap[owner])
    removeFiles(prOwnerOwnerMap, prOwnerOwnerMap[owner])
    owner = getBestOwner(prOwnerOwnerMap)
  }
}

function getAnyCoveragePrs(ownerMap) {
  let prs = []
  let owner = getBestOwner(ownerMap)
  while (owner) {
    const files = ownerMap[owner]
    const owners = getOwners(ownerMap, files)
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

function getOwners(ownerMap, files) {
  let owners = []
  _.each(ownerMap, (ownedFiles, owner) => {
    const coverFiles = files.every(f => ownedFiles.includes(f))
    if (coverFiles) owners.push(owner)
  })
  return owners
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

function getFiles(prs) {
  return _.unique(_.flatten(prs.map(pr => pr.files)))
}
