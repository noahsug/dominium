Object.defineProperty(exports, "__esModule", {
  value: true
});
function rg() {
  return Promise.resolve(rg.__results);
}

rg.__setMockResults = results => {
  rg.__results = results;
};

exports["default"] = rg;
module.exports = exports["default"];