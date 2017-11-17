Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendObjValues = appendObjValues;

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// Usage: appendValues({a: [1, 2]}, {a: [3], b: [4]}) -> {a: [1, 2, 3], b: [4]}
function appendObjValues(source, target) {
  _underscore2['default'].each(target, (values, key) => {
    source[key] = (source[key] || []).concat(values);
  });
  return source;
}