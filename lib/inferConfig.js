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
var path = require("path");
var createRequire_1 = require("./createRequire");
var getDeps_1 = require("./getDeps");
var upDirs_1 = require("./upDirs");
var entryExts = ['js', 'jsx', 'ts', 'tsx'];
var entryDirs = ['.', 'src'];
var entryCandidates = [];
var _loop_1 = function (dir) {
    entryCandidates = entryCandidates.concat(entryExts.map(function (ext) { return './' + path.join(dir, 'index.' + ext); }));
};
for (var _i = 0, entryDirs_1 = entryDirs; _i < entryDirs_1.length; _i++) {
    var dir = entryDirs_1[_i];
    _loop_1(dir);
}
var isSpinApp = function (pkg) {
    return (Object.keys(pkg.dependencies || {})
        .concat(Object.keys(pkg.devDependencies || {}))
        .indexOf('spinjs') >= 0 ||
        (pkg.scripts && pkg.scripts.build && pkg.scripts.build.indexOf('spin build') >= 0));
};
exports.default = (function (pkg, pkgJsonPath) {
    var _a, _b;
    if (!isSpinApp(pkg)) {
        return undefined;
    }
    var pkgPathList = upDirs_1.default(path.dirname(pkgJsonPath), 'package.json');
    var deps = {};
    for (var _i = 0, pkgPathList_1 = pkgPathList; _i < pkgPathList_1.length; _i++) {
        var pkgPath = pkgPathList_1[_i];
        if (fs.existsSync(pkgPath)) {
            var pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            var requireDep = createRequire_1.default(path.dirname(pkgPath));
            deps = __assign({}, deps, getDeps_1.default(pkgPath, requireDep, {}), (pkgJson.devDependencies || {}));
        }
    }
    var entry;
    for (var _c = 0, entryCandidates_1 = entryCandidates; _c < entryCandidates_1.length; _c++) {
        var entryPath = entryCandidates_1[_c];
        if (fs.existsSync(path.join(path.dirname(pkgJsonPath), entryPath))) {
            entry = entryPath;
            break;
        }
    }
    if (!entry) {
        throw new Error('Cannot find entry file, tried: ' + entryCandidates);
    }
    var stack = [];
    if (deps['apollo-server-express']) {
        stack.push('server');
    }
    if (deps['react-native']) {
        stack.push('android');
    }
    else if (deps['react-dom']) {
        stack.push('web');
    }
    if (deps['babel-core']) {
        stack.push('es6');
    }
    stack.push('js');
    if (deps.typescript) {
        stack.push('ts');
    }
    if (deps['apollo-server-express'] || deps['react-apollo'] || deps['apollo-boost'] || deps['apollo-link']) {
        stack.push('apollo');
    }
    if (deps.react) {
        stack.push('react');
    }
    if (deps['react-native']) {
        stack.push('react-native');
    }
    if (deps['styled-components']) {
        stack.push('styled-components');
    }
    if (deps['css-loader']) {
        stack.push('css');
    }
    if (deps['sass-loader']) {
        stack.push('sass');
    }
    if (deps['less-loader']) {
        stack.push('less');
    }
    if (deps.webpack) {
        stack.push('webpack');
    }
    var config;
    var builderDefaults = {
        entry: entry,
        silent: true,
        nodeDebugger: false
    };
    if (stack.indexOf('react-native') >= 0) {
        var builderAndroid = __assign({ stack: stack }, builderDefaults);
        var iosStack = stack.slice();
        iosStack[stack.indexOf('android')] = 'ios';
        var builderIOS = __assign({ stack: iosStack }, builderDefaults);
        config = {
            builders: (_a = {},
                _a[pkg.name + '-android'] = builderAndroid,
                _a[pkg.name + '-ios'] = builderIOS,
                _a),
            options: {
                defines: {
                    __DEV__: process.env.NODE_ENV !== 'production'
                }
            }
        };
    }
    else {
        var builder = __assign({ stack: stack }, builderDefaults);
        config = {
            builders: (_b = {},
                _b[pkg.name] = builder,
                _b)
        };
    }
    return config;
});
//# sourceMappingURL=inferConfig.js.map