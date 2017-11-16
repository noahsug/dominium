Object.defineProperty(exports, "__esModule", {
  value: true
});
exports['default'] = getPullRequests;

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function getPullRequests(ownerMap) {
  let prs = getBestCoveragePrs(ownerMap);
  removeFiles(ownerMap, getFiles(prs));
  addSingleOwnerCoveredFiles(prs, ownerMap);
  removeFiles(ownerMap, getFiles(prs));
  return prs.concat(getAnyCoveragePrs(ownerMap));
}

function getBestCoveragePrs(ownerMap) {
  const prs = [];
  const pairOwnerMap = getPairOwnerMap(ownerMap);
  let ownerPair = getBestOwner(pairOwnerMap);
  while (ownerPair) {
    const files = pairOwnerMap[ownerPair];
    if (files.length === 1) break;
    const owners = getOwners(ownerMap, files);
    prs.push({ owners, files });
    removeFiles(pairOwnerMap, files);
    ownerPair = getBestOwner(pairOwnerMap);
  }
  return prs;
}

function getPairOwnerMap(ownerMap) {
  const pairOwnerMap = {};
  const ownerPairs = getOwnerPairs(Object.keys(ownerMap));
  ownerPairs.forEach(pair => {
    const files = _underscore2['default'].intersection(ownerMap[pair[0]], ownerMap[pair[1]]);
    pairOwnerMap[pair.join(',')] = files;
  });
  return pairOwnerMap;
}

function getOwnerPairs(owners) {
  let pairs = [];
  for (let i = 0; i < owners.length; i++) {
    for (let j = i + 1; j < owners.length; j++) {
      pairs.push([owners[i], owners[j]]);
    }
  }
  return pairs;
}

function addSingleOwnerCoveredFiles(prs, ownerMap) {
  const ownersInPrs = _underscore2['default'].unique(_underscore2['default'].flatten(prs.map(pr => pr.owners)));
  const prOwnerOwnerMap = _underscore2['default'].pick(ownerMap, ...ownersInPrs);
  let owner = getBestOwner(prOwnerOwnerMap);
  while (owner) {
    const pr = prs.find(pr => pr.owners.includes(owner));
    if (!pr) break;
    pr.files = pr.files.concat(prOwnerOwnerMap[owner]);
    removeFiles(prOwnerOwnerMap, prOwnerOwnerMap[owner]);
    owner = getBestOwner(prOwnerOwnerMap);
  }
}

function getAnyCoveragePrs(ownerMap) {
  let prs = [];
  let owner = getBestOwner(ownerMap);
  while (owner) {
    const files = ownerMap[owner];
    const owners = getOwners(ownerMap, files);
    prs.push({ owners, files });
    removeFiles(ownerMap, files);
    owner = getBestOwner(ownerMap);
  }
  return prs;
}

function getBestOwner(ownerMap) {
  const owners = Object.keys(ownerMap);
  if (!owners.length) return null;
  return _underscore2['default'].max(owners, owner => ownerMap[owner].length);
}

function getOwners(ownerMap, files) {
  let owners = [];
  _underscore2['default'].each(ownerMap, (ownedFiles, owner) => {
    const coverFiles = files.every(f => ownedFiles.includes(f));
    if (coverFiles) owners.push(owner);
  });
  return owners;
}

function removeFiles(ownerMap, files) {
  const owners = Object.keys(ownerMap);
  owners.forEach(owner => {
    const remainingFiles = _underscore2['default'].difference(ownerMap[owner], files);
    if (remainingFiles.length) {
      ownerMap[owner] = remainingFiles;
    } else {
      delete ownerMap[owner];
    }
  });
}

function getFiles(prs) {
  return _underscore2['default'].unique(_underscore2['default'].flatten(prs.map(pr => pr.files)));
}
module.exports = exports['default'];