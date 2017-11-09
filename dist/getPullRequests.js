Object.defineProperty(exports, "__esModule", {
  value: true
});

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _getTeams = require('./getTeams');

var _getTeams2 = _interopRequireDefault(_getTeams);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

Function.prototype.$asyncbind = function () {
  function $asyncbind(self, catcher) {
    "use strict";

    if (!Function.prototype.$asyncbind) {
      Object.defineProperty(Function.prototype, "$asyncbind", {
        value: $asyncbind,
        enumerable: false,
        configurable: true,
        writable: true
      });
    }

    if (!$asyncbind.trampoline) {
      $asyncbind.trampoline = function () {
        function trampoline(t, x, s, e, u) {
          return function () {
            function b(q) {
              while (q) {
                if (q.then) {
                  q = q.then(b, e);
                  return u ? undefined : q;
                }

                try {
                  if (q.pop) {
                    if (q.length) return q.pop() ? x.call(t) : q;
                    q = s;
                  } else q = q.call(t);
                } catch (r) {
                  return e(r);
                }
              }
            }

            return b;
          }();
        }

        return trampoline;
      }();
    }

    if (!$asyncbind.LazyThenable) {
      $asyncbind.LazyThenable = function () {
        function isThenable(obj) {
          return obj && obj instanceof Object && typeof obj.then === "function";
        }

        function resolution(p, r, how) {
          try {
            var x = how ? how(r) : r;
            if (p === x) return p.reject(new TypeError("Promise resolution loop"));

            if (isThenable(x)) {
              x.then(function (y) {
                resolution(p, y);
              }, function (e) {
                p.reject(e);
              });
            } else {
              p.resolve(x);
            }
          } catch (ex) {
            p.reject(ex);
          }
        }

        function Chained() {}

        ;
        Chained.prototype = {
          resolve: _unchained,
          reject: _unchained,
          then: thenChain
        };

        function _unchained(v) {}

        function thenChain(res, rej) {
          this.resolve = res;
          this.reject = rej;
        }

        function then(res, rej) {
          var chain = new Chained();

          try {
            this._resolver(function (value) {
              return isThenable(value) ? value.then(res, rej) : resolution(chain, value, res);
            }, function (ex) {
              resolution(chain, ex, rej);
            });
          } catch (ex) {
            resolution(chain, ex, rej);
          }

          return chain;
        }

        function Thenable(resolver) {
          this._resolver = resolver;
          this.then = then;
        }

        ;

        Thenable.resolve = function (v) {
          return Thenable.isThenable(v) ? v : {
            then: function (resolve) {
              return resolve(v);
            }
          };
        };

        Thenable.isThenable = isThenable;
        return Thenable;
      }();

      $asyncbind.EagerThenable = $asyncbind.Thenable = ($asyncbind.EagerThenableFactory = function (tick) {
        tick = tick || typeof process === "object" && process.nextTick || typeof setImmediate === "function" && setImmediate || function (f) {
          setTimeout(f, 0);
        };

        var soon = function () {
          var fq = [],
              fqStart = 0,
              bufferSize = 1024;

          function callQueue() {
            while (fq.length - fqStart) {
              try {
                fq[fqStart]();
              } catch (ex) {}

              fq[fqStart++] = undefined;

              if (fqStart === bufferSize) {
                fq.splice(0, bufferSize);
                fqStart = 0;
              }
            }
          }

          return function (fn) {
            fq.push(fn);
            if (fq.length - fqStart === 1) tick(callQueue);
          };
        }();

        function Zousan(func) {
          if (func) {
            var me = this;
            func(function (arg) {
              me.resolve(arg);
            }, function (arg) {
              me.reject(arg);
            });
          }
        }

        Zousan.prototype = {
          resolve: function (value) {
            if (this.state !== undefined) return;
            if (value === this) return this.reject(new TypeError("Attempt to resolve promise with self"));
            var me = this;

            if (value && (typeof value === "function" || typeof value === "object")) {
              try {
                var first = 0;
                var then = value.then;

                if (typeof then === "function") {
                  then.call(value, function (ra) {
                    if (!first++) {
                      me.resolve(ra);
                    }
                  }, function (rr) {
                    if (!first++) {
                      me.reject(rr);
                    }
                  });
                  return;
                }
              } catch (e) {
                if (!first) this.reject(e);
                return;
              }
            }

            this.state = STATE_FULFILLED;
            this.v = value;
            if (me.c) soon(function () {
              for (var n = 0, l = me.c.length; n < l; n++) STATE_FULFILLED(me.c[n], value);
            });
          },
          reject: function (reason) {
            if (this.state !== undefined) return;
            this.state = STATE_REJECTED;
            this.v = reason;
            var clients = this.c;
            if (clients) soon(function () {
              for (var n = 0, l = clients.length; n < l; n++) STATE_REJECTED(clients[n], reason);
            });
          },
          then: function (onF, onR) {
            var p = new Zousan();
            var client = {
              y: onF,
              n: onR,
              p: p
            };

            if (this.state === undefined) {
              if (this.c) this.c.push(client);else this.c = [client];
            } else {
              var s = this.state,
                  a = this.v;
              soon(function () {
                s(client, a);
              });
            }

            return p;
          }
        };

        function STATE_FULFILLED(c, arg) {
          if (typeof c.y === "function") {
            try {
              var yret = c.y.call(undefined, arg);
              c.p.resolve(yret);
            } catch (err) {
              c.p.reject(err);
            }
          } else c.p.resolve(arg);
        }

        function STATE_REJECTED(c, reason) {
          if (typeof c.n === "function") {
            try {
              var yret = c.n.call(undefined, reason);
              c.p.resolve(yret);
            } catch (err) {
              c.p.reject(err);
            }
          } else c.p.reject(reason);
        }

        Zousan.resolve = function (val) {
          if (val && val instanceof Zousan) return val;
          var z = new Zousan();
          z.resolve(val);
          return z;
        };

        Zousan.reject = function (err) {
          if (err && err instanceof Zousan) return err;
          var z = new Zousan();
          z.reject(err);
          return z;
        };

        Zousan.version = "2.3.3-nodent";
        return Zousan;
      })();
    }

    var resolver = this;

    switch (catcher) {
      case true:
        return new $asyncbind.Thenable(boundThen);

      case 0:
        return new $asyncbind.LazyThenable(boundThen);

      case undefined:
        boundThen.then = boundThen;
        return boundThen;

      default:
        return function () {
          try {
            return resolver.apply(self, arguments);
          } catch (ex) {
            return catcher(ex);
          }
        };
    }

    function boundThen() {
      return resolver.apply(self, arguments);
    }
  }

  return $asyncbind;
}();

exports['default'] = function () {
  function getPullRequests(ownership) {
    return new Promise(function ($return, $error) {
      let prs;
      return getBestCoveragePrs(ownership).then(function ($await_5) {
        prs = $await_5;
        removeFiles(ownership, getFiles(prs));
        addSingleOwnerCoveredFiles(prs, ownership);
        removeFiles(ownership, getFiles(prs));
        return prs.concat(getAnyCoveragePrs(ownership)).then($return, $error);
      }.$asyncbind(this, $error), $error);
    }.$asyncbind(this));
  }

  return getPullRequests;
}();

function getBestCoveragePrs(ownership) {
  return new Promise(function ($return, $error) {
    var prs, pairOwnership, files, owners;
    let ownerPair;
    prs = [];
    pairOwnership = getPairOwnership(ownership);

    ownerPair = getBestOwner(pairOwnership);
    return Function.$asyncbind.trampoline(this, $Loop_1_exit, $Loop_1, $error, true)($Loop_1);

    function $Loop_1() {
      if (ownerPair) {
        files = pairOwnership[ownerPair];

        if (files.length === 1) return [1];
        return getOwners(ownership, files).then(function ($await_7) {
          owners = $await_7;

          prs.push({ owners, files });
          removeFiles(pairOwnership, files);
          ownerPair = getBestOwner(pairOwnership);
          return $Loop_1;
        }.$asyncbind(this, $error), $error);
      } else return [1];
    }

    function $Loop_1_exit() {
      return $return(prs);
    }
  }.$asyncbind(this));
}

function getPairOwnership(ownership) {
  const pairOwnership = {};
  const ownerPairs = getOwnerPairs(Object.keys(ownership));
  ownerPairs.forEach(pair => {
    const files = _underscore2['default'].intersection(ownership[pair[0]], ownership[pair[1]]);
    pairOwnership[pair.join(',')] = files;
  });
  return pairOwnership;
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

function addSingleOwnerCoveredFiles(prs, ownership) {
  const ownersInPrs = _underscore2['default'].unique(_underscore2['default'].flatten(prs.map(pr => pr.owners)));
  const prOwnerOwnership = _underscore2['default'].pick(ownership, ...ownersInPrs);
  let owner = getBestOwner(prOwnerOwnership);
  while (owner) {
    const pr = prs.find(pr => pr.owners.includes(owner));
    if (!pr) break;
    pr.files = pr.files.concat(prOwnerOwnership[owner]);
    removeFiles(prOwnerOwnership, prOwnerOwnership[owner]);
    owner = getBestOwner(prOwnerOwnership);
  }
}

function getAnyCoveragePrs(ownership) {
  return new Promise(function ($return, $error) {
    var files, owners;
    let prs, owner;

    prs = [];
    owner = getBestOwner(ownership);
    return Function.$asyncbind.trampoline(this, $Loop_3_exit, $Loop_3, $error, true)($Loop_3);

    function $Loop_3() {
      if (owner) {
        files = ownership[owner];
        return getOwners(ownership, files).then(function ($await_8) {
          owners = $await_8;

          prs.push({ owners, files });
          removeFiles(ownership, files);
          owner = getBestOwner(ownership);
          return $Loop_3;
        }.$asyncbind(this, $error), $error);
      } else return [1];
    }

    function $Loop_3_exit() {
      return $return(prs);
    }
  }.$asyncbind(this));
}

function getBestOwner(ownership) {
  const owners = Object.keys(ownership);
  if (!owners.length) return null;
  return _underscore2['default'].max(owners, owner => ownership[owner].length);
}

function getOwners(ownership, files) {
  return new Promise(function ($return, $error) {
    // TODO replace multiple owners with a single team
    let owners = [];
    _underscore2['default'].each(ownership, (ownedFiles, owner) => {
      const coverFiles = files.every(f => ownedFiles.includes(f));
      if (coverFiles) owners.push(owner);
    });
    return $return(owners);
  }.$asyncbind(this));
}

function removeFiles(ownership, files) {
  const owners = Object.keys(ownership);
  owners.forEach(owner => {
    const remainingFiles = _underscore2['default'].difference(ownership[owner], files);
    if (remainingFiles.length) {
      ownership[owner] = remainingFiles;
    } else {
      delete ownership[owner];
    }
  });
}

function getFiles(prs) {
  return _underscore2['default'].unique(_underscore2['default'].flatten(prs.map(pr => pr.files)));
}
module.exports = exports['default'];