Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeFetchJson = require('node-fetch-json');

var _nodeFetchJson2 = _interopRequireDefault(_nodeFetchJson);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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

const teamsPath = _path2['default'].resolve(_config2['default'].writePath, 'teams.json');
const accessToken = '16a890797521394521bd64dfc235f2502ab58366';
const gitUrl = 'https://git.musta.ch/api/v3';
const org = 'airbnb';
// process.env.AUTH_TOKEN

function getTeams() {
  return new Promise(function ($return, $error) {
    let teams;

    if (_config2['default'].noCache) {
      return writeTeams().then($return, $error);
    }
    var $Try_1_Post = function () {
      return $return(teams);
    }.$asyncbind(this, $error);var $Try_1_Catch = function (e) {
      return writeTeams().then(function ($await_7) {
        teams = $await_7;
        return $Try_1_Post();
      }.$asyncbind(this, $error), $error);
    }.$asyncbind(this, $error);
    try {
      return readTeams().then(function ($await_8) {
        teams = $await_8;
        return $Try_1_Post();
      }.$asyncbind(this, $Try_1_Catch), $Try_1_Catch);
    } catch (e) {
      $Try_1_Catch(e)
    }
  }.$asyncbind(this));
}

function writeTeams() {
  return new Promise(function ($return, $error) {
    var teams;
    return fetchTeams().then(function ($await_9) {
      teams = $await_9;

      return $return(new Promise(resolve => {
        _fs2['default'].writeFile(teamsPath, JSON.stringify(teams), (err, result) => {
          if (err) throw new Error('Failed to write teams: ' + String(err));
          resolve(teams);
        });
      }));
    }.$asyncbind(this, $error), $error);
  }.$asyncbind(this));
}

function fetchTeams() {
  return new Promise(function ($return, $error) {
    var teams;
    let page, next;
    teams = {};

    page = 1;
    return getNextTeams(page).then(function ($await_10) {
      next = $await_10;
      return Function.$asyncbind.trampoline(this, $Loop_3_exit, $Loop_3, $error, true)($Loop_3);

      function $Loop_3() {
        if (!_underscore2['default'].isEmpty(next)) {
          Object.assign(teams, next);
          page += 1;
          return getNextTeams(page).then(function ($await_11) {
            next = $await_11;
            return $Loop_3;
          }.$asyncbind(this, $error), $error);
        } else return [1];
      }

      function $Loop_3_exit() {
        return $return(teams);
      }
    }.$asyncbind(this, $error), $error);
  }.$asyncbind(this));
}

function getNextTeams(page) {
  return new Promise(function ($return, $error) {
    var url, data, teams;
    url = [gitUrl, '/orgs/', org, '/teams', '?per_page=100', '&access_token=' + accessToken, '&page=' + String(page)].join('');
    return (0, _nodeFetchJson2['default'])(url, { method: 'GET' }).then(function ($await_12) {
      data = $await_12;
      teams = {};

      for (const team of data) {
        teams[team.name] = team.id;
      }
      return $return(teams);
    }.$asyncbind(this, $error), $error);
  }.$asyncbind(this));
}

function readTeams() {
  return new Promise(function ($return, $error) {
    return $return(new Promise((resolve, reject) => {
      _fs2['default'].readFile(teamsPath, 'utf8', (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(result));
        }
      });
    }));
  }.$asyncbind(this));
}

let teams;
function cachedGetTeams() {
  return new Promise(function ($return, $error) {
    if (!teams) {
      return getTeams().then(function ($await_13) {
        teams = $await_13;
        return $If_5.call(this);
      }.$asyncbind(this, $error), $error);
    }
    function $If_5() {
      return $return(teams);
    }

    return $If_5.call(this);
  }.$asyncbind(this));
}

exports['default'] = cachedGetTeams;
module.exports = exports['default'];