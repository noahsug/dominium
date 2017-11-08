Object.defineProperty(exports, "__esModule", {
  value: true
});
const args = process.argv.slice(2);

const config = {
  root: process.cwd(),
  dryRun: args.includes('--dryrun'),
  ownersFile: 'MANDATORY_REVIEWERS',
  groupPrefix: 'airbnb/',
  noOwnerBranchName: 'unowned',
  teams: {
    'mt-places': ['emily-zhao', 'andrew-scheuermann']
  }
};

exports['default'] = config;
module.exports = exports['default'];