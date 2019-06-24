"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var requireRelative = require("require-relative");
exports.default = (function (cwd) {
    var require = function (name, relativeTo) { return requireModule(name, relativeTo || cwd); };
    require.resolve = function (name, relativeTo) { return requireModule.resolve(name, relativeTo || cwd); };
    require.probe = function (name, relativeTo) { return requireModule.probe(name, relativeTo || cwd); };
    require.cwd = cwd;
    return require;
});
var requireModule = function (name, relativeTo) {
    return name.indexOf('.') !== 0 ? requireRelative(name, relativeTo) : require(path.join(relativeTo, name));
};
requireModule.resolve = function (name, relativeTo) {
    return name.indexOf('.') !== 0
        ? requireRelative.resolve(name, relativeTo)
        : require.resolve(path.join(relativeTo, name));
};
requireModule.probe = function (name, relativeTo) {
    try {
        return requireModule.resolve(name, relativeTo);
    }
    catch (e) {
        return null;
    }
};
//# sourceMappingURL=createRequire.js.map