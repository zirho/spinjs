"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webpackHooks_1 = require("../../webpackHooks");
function notifyWatcher(watcher) {
    var headers = {
        'Content-Type': 'application/json; charset=UTF-8'
    };
    watcher.res.writeHead(205, headers);
    watcher.res.end(JSON.stringify({ changed: true }));
}
function liveReloadMiddleware(compiler) {
    var watchers = [];
    var notify = false;
    webpackHooks_1.hookSync(compiler, 'done', function () {
        watchers.forEach(function (watcher) {
            notifyWatcher(watcher);
        });
        if (!watchers.length) {
            notify = true;
        }
        watchers = [];
    });
    return function (req, res, next) {
        if (req.path === '/onchange') {
            var watcher = { req: req, res: res };
            if (notify) {
                notifyWatcher(watcher);
                notify = false;
            }
            else {
                watchers.push(watcher);
                req.on('close', function () {
                    for (var i = 0; i < watchers.length; i++) {
                        if (watchers[i] && watchers[i].req === req) {
                            watchers.splice(i, 1);
                            break;
                        }
                    }
                });
            }
        }
        else {
            next();
        }
    };
}
exports.default = liveReloadMiddleware;
//# sourceMappingURL=liveReloadMiddleware.js.map