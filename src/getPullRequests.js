import _ from 'underscore'

export default function getPullRequests(ownership) {
  let prs = getBestCoveragePrs(ownership)
  removeFiles(ownership, getFiles(prs))
  addSingleOwnerCoveredFiles(prs, ownership)
  removeFiles(ownership, getFiles(prs))
  return prs.concat(getAnyCoveragePrs(ownership))
}

function getBestCoveragePrs(ownership) {
  const prs = []
  const pairOwnership = getPairOwnership(ownership)
  let ownerPair = getBestOwner(pairOwnership)
  while (ownerPair) {
    const files = pairOwnership[ownerPair]
    if (files.length === 1) break
    const owners = getOwners(ownership, files)
    prs.push({ owners, files })
    removeFiles(pairOwnership, files)
    ownerPair = getBestOwner(pairOwnership)
  }
  return prs
}

function getPairOwnership(ownership) {
  const pairOwnership = {}
  const ownerPairs = getOwnerPairs(Object.keys(ownership))
  ownerPairs.forEach(pair => {
    const files = _.intersection(ownership[pair[0]], ownership[pair[1]])
    pairOwnership[pair.join(',')] = files
  })
  return pairOwnership
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

function addSingleOwnerCoveredFiles(prs, ownership) {
  const ownersInPrs = _.unique(_.flatten(prs.map(pr => pr.owners)))
  const prOwnerOwnership = _.pick(ownership, ...ownersInPrs)
  let owner = getBestOwner(prOwnerOwnership)
  while (owner) {
    const pr = prs.find(pr => pr.owners.includes(owner))
    if (!pr) break
    pr.files = pr.files.concat(prOwnerOwnership[owner])
    removeFiles(prOwnerOwnership, prOwnerOwnership[owner])
    owner = getBestOwner(prOwnerOwnership)
  }
}

function getAnyCoveragePrs(ownership) {
  let prs = []
  let owner = getBestOwner(ownership)
  while (owner) {
    const files = ownership[owner]
    const owners = getOwners(ownership, files)
    prs.push({ owners, files })
    removeFiles(ownership, files)
    owner = getBestOwner(ownership)
  }
  return prs
}

function getBestOwner(ownership) {
  const owners = Object.keys(ownership)
  if (!owners.length) return null
  return _.max(owners, owner => ownership[owner].length)
}

function getOwners(ownership, files) {
  let owners = []
  _.each(ownership, (ownedFiles, owner) => {
    const coverFiles = files.every(f => ownedFiles.includes(f))
    if (coverFiles) owners.push(owner)
  })
  return owners
}

function removeFiles(ownership, files) {
  const owners = Object.keys(ownership)
  owners.forEach(owner => {
    const remainingFiles = _.difference(ownership[owner], files)
    if (remainingFiles.length) {
      ownership[owner] = remainingFiles
    } else {
      delete ownership[owner]
    }
  })
}

function getFiles(prs) {
  return _.unique(_.flatten(prs.map(pr => pr.files)))
}
