"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var glob_1 = require("glob");
var _ = require("lodash");
var path = require("path");
var ConfigReader_1 = require("./ConfigReader");
var BuilderDiscoverer = (function () {
    function BuilderDiscoverer(spin, plugins, argv) {
        this.configReader = new ConfigReader_1.default(spin, plugins);
        this.cwd = spin.cwd;
        this.argv = argv;
    }
    BuilderDiscoverer.prototype.discover = function () {
        var _this = this;
        var packageRootPaths = this._detectRootPaths();
        return packageRootPaths.reduce(function (res, pathName) {
            return __assign({}, res, _this._discoverRecursively(pathName));
        }, {});
    };
    BuilderDiscoverer.prototype._discoverRecursively = function (dir) {
        if (path.basename(dir) === '.expo') {
            return undefined;
        }
        var builders;
        if (this.argv.c) {
            builders = this.configReader.readConfig(path.join(dir, this.argv.c));
        }
        else {
            var candidates = ['.spinrc.json', '.spinrc', '.spinrc.js', 'package.json'];
            for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
                var fileName = candidates_1[_i];
                builders = this.configReader.readConfig(path.join(dir, fileName));
                if (builders) {
                    break;
                }
            }
        }
        var files = fs.readdirSync(dir);
        for (var _a = 0, files_1 = files; _a < files_1.length; _a++) {
            var name = files_1[_a];
            var dirPath = path.join(dir, name);
            if (name !== 'node_modules' && fs.statSync(dirPath).isDirectory()) {
                builders = __assign({}, builders, this._discoverRecursively(dirPath));
            }
        }
        return builders;
    };
    BuilderDiscoverer.prototype._detectRootPaths = function () {
        var _this = this;
        var rootConfig = JSON.parse(fs.readFileSync(this.cwd + "/package.json", 'utf8'));
        return rootConfig.workspaces && rootConfig.workspaces.length
            ? _.flatten(rootConfig.workspaces.map(function (ws) { return glob_1.glob.sync(ws); })).map(function (ws) { return path.join(_this.cwd, ws); })
            : [this.cwd];
    };
    return BuilderDiscoverer;
}());
exports.default = BuilderDiscoverer;
//# sourceMappingURL=BuilderDiscoverer.js.map