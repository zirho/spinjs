"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var merge = require("webpack-merge");
var createRequire_1 = require("./createRequire");
var EnhancedError_1 = require("./EnhancedError");
var inferConfig_1 = require("./inferConfig");
var Stack_1 = require("./Stack");
var ConfigReader = (function () {
    function ConfigReader(spin, plugins) {
        this.spin = spin;
        this.plugins = plugins;
    }
    ConfigReader.prototype.readConfig = function (filePath) {
        var configObject;
        if (fs.existsSync(filePath)) {
            process.chdir(path.dirname(filePath));
            try {
                var extname = path.extname(filePath);
                if (['.json', ''].indexOf(extname) >= 0) {
                    try {
                        configObject = JSON.parse(fs.readFileSync(filePath).toString());
                        if (path.basename(filePath) === 'package.json') {
                            configObject = configObject.spin || inferConfig_1.default(configObject, filePath);
                        }
                    }
                    catch (e) {
                        throw new EnhancedError_1.default("Error parsing " + path.resolve(filePath), e);
                    }
                }
                else {
                    var exports_1 = require(path.resolve(filePath));
                    configObject = exports_1 instanceof Function ? exports_1(this.spin) : exports_1;
                }
            }
            finally {
                process.chdir(this.spin.cwd);
            }
        }
        return typeof configObject === 'undefined' ? undefined : this._createBuilders(filePath, configObject);
    };
    ConfigReader.prototype._createBuilders = function (filePath, config) {
        if (typeof config === 'string' || (typeof config === 'object' && config.constructor === Array)) {
            config = {
                builders: {
                    app: config
                }
            };
        }
        config.options = config.options || {};
        var relativePath = path.relative(this.spin.cwd, path.dirname(filePath));
        var builders = {};
        var _a = config.options, stack = _a.stack, plugins = _a.plugins, options = __rest(_a, ["stack", "plugins"]);
        for (var _i = 0, _b = Object.keys(config.builders); _i < _b.length; _i++) {
            var name = _b[_i];
            var builderVal = config.builders[name];
            var builder = typeof builderVal === 'object' && builderVal.constructor !== Array ? __assign({}, builderVal) : { stack: builderVal };
            builder.name = name;
            builder.require = createRequire_1.default(path.resolve(relativePath));
            builder.stack = new Stack_1.default(config.options.stack || [], typeof builder === 'object' ? builder.stack : builder);
            builder.plugins = (config.plugins || []).concat(builder.plugins || []);
            builder.roles = builder.roles || ['build', 'watch'];
            var merged = merge(options, builder);
            for (var _c = 0, _d = Object.keys(merged); _c < _d.length; _c++) {
                var key = _d[_c];
                builder[key] = merged[key];
            }
            var builderId = relativePath + "[" + builder.name + "]";
            builder.id = builderId;
            builders[builderId] = builder;
            builder.buildDir = builder.backendBuildDir || builder.frontendBuildDir ? undefined : builder.buildDir || 'build';
            builder.nodeDebugger = typeof builder.nodeDebugger !== 'undefined' ? builder.nodeDebugger : true;
            builder.dllBuildDir = builder.dllBuildDir || 'build/dll';
            builder.webpackDll = typeof builder.webpackDll !== 'undefined' ? builder.webpackDll : true;
            builder.sourceMap = typeof builder.sourceMap !== 'undefined' ? builder.sourceMap : true;
            builder.minify = typeof builder.minify !== 'undefined' ? builder.minify : true;
            builder.cache =
                typeof builder.cache === 'string' && builder.cache !== 'auto'
                    ? builder.cache
                    : typeof builder.cache !== 'undefined'
                        ? builder.cache
                        : 'auto';
            builder.plugins = this.plugins.concat((builder.plugins || []).map(function (pluginName) { return new (require(pluginName))(); }));
        }
        return builders;
    };
    return ConfigReader;
}());
exports.default = ConfigReader;
//# sourceMappingURL=ConfigReader.js.map