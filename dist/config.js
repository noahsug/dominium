Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

const args = process.argv.slice(2);

const config = {
  gitPath: process.argv[0],
  writePath: _path2['default'].resolve(process.argv[1], '../'),
  dryRun: args.includes('--dryrun'),
  noCache: args.includes('--no-cache'),
  ownersFile: 'MANDATORY_REVIEWERS',
  teamPrefix: 'airbnb/',
  noOwnerBranchName: 'unowned',
  teams: {
    'mt-places': ['emily-zhao', 'andrew-scheuermann']
  }
};

exports['default'] = config;
module.exports = exports['default'];