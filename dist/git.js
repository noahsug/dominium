Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleGit = require('simple-git');

var _simpleGit2 = _interopRequireDefault(_simpleGit);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _config = require('./config');

var _utils = require('./utils');

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

function getChangedFiles() {
  return new Promise(resolve => {
    (0, _simpleGit2['default'])(_config.gitPath).show(['--oneline', '--name-only'], (err, result) => {
      resolve(result.split('\n').slice(1, -1));
    });
  });
}

const gitInfo = {};

function init() {
  return new Promise(function ($return, $error) {
    return getGitInfo().then(function ($await_1) {
      Object.assign(gitInfo, $await_1);
      return $return();
    }.$asyncbind(this, $error), $error);
  }.$asyncbind(this));
}

function getGitInfo() {
  const gitInfo = {};
  return new Promise(resolve => {
    (0, _simpleGit2['default'])(_config.gitPath).raw(['log', '--oneline', '-2'], (err, result) => {
      (0, _utils.checkError)(err);
      const commits = result.split('\n');
      gitInfo.commits = {
        change: commits[0].split(' ')[0],
        base: commits[1].split(' ')[0]
      };
      gitInfo.commitMsg = commits[0].split(' ').slice(1).join(' ');
    }).revparse(['--abbrev-ref', 'HEAD'], (err, result) => {
      (0, _utils.checkError)(err);
      gitInfo.branch = result.trim();
    }).exec(() => {
      resolve(gitInfo);
    });
  });
}

function createPrBranch(pr, { branchSuffix, commitMsgSuffix = '' }) {
  checkGitInitCalled();
  return new Promise(resolve => {
    (0, _simpleGit2['default'])(_config.gitPath).checkoutBranch(getBranchName(branchSuffix), gitInfo.commits.base, _utils.checkError).checkout([gitInfo.commits.change, ...pr.files], _utils.checkError).commit(String(gitInfo.commitMsg) + ' ' + String(commitMsgSuffix), _utils.checkError).exec(resolve);
  });
}

function getBranchName(suffix) {
  return String(gitInfo.branch) + '-' + String(suffix);
}

function checkoutOriginalBranch() {
  return new Promise(function ($return, $error) {
    checkGitInitCalled();
    return $return(new Promise(resolve => {
      (0, _simpleGit2['default'])(_config.gitPath).checkout(gitInfo.branch, _utils.checkError).exec(resolve);
    }));
  }.$asyncbind(this));
}

function checkGitInitCalled() {
  if (_underscore2['default'].isEmpty(gitInfo)) throw new Error('git.init() never called');
}

exports['default'] = {
  getChangedFiles,
  getBranchName,
  checkoutOriginalBranch,
  createPrBranch,
  init
};
module.exports = exports['default'];