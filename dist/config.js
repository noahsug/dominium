Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cosmiconfig = require('cosmiconfig');

var _cosmiconfig2 = _interopRequireDefault(_cosmiconfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

const explorer = (0, _cosmiconfig2['default'])('dominium', { sync: true });
const loadedConfig = (explorer.load('.') || { config: {} }).config;
const args = process.argv.slice(2);

const config = {
  ownerFileName: loadedConfig.ownerFileName || 'MANDATORY_REVIEWERS',
  ownerCommentTag: loadedConfig.ownerCommentTag || 'MANDATORY_REVIEWERS',
  noOwnerBranchSuffix: loadedConfig.noOwnerBranchSuffix || 'unowned',
  accessToken: loadedConfig.accessToken || process.env.AUTH_TOKEN,
  teamPrefix: loadedConfig.teamPrefix || '',
  gitApiUrl: loadedConfig.gitApiUrl,
  gitPath: process.cwd()
};

exports['default'] = config;
module.exports = exports['default'];