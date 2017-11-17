Object.defineProperty(exports, "__esModule", {
  value: true
});

var _yesno = require('yesno');

var _yesno2 = _interopRequireDefault(_yesno);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function ask(question) {
  return new Promise(resolve => {
    _yesno2['default'].ask(String(question) + ' [Y/n]', false, ok => {
      resolve(ok);
    });
  });
}

exports['default'] = { ask };
module.exports = exports['default'];