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
var getDeps = function (packageJsonPath, requireDep, deps) {
    var pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    var pkgDeps = Object.keys(pkg.dependencies || {});
    var result = __assign({}, deps);
    for (var _i = 0, pkgDeps_1 = pkgDeps; _i < pkgDeps_1.length; _i++) {
        var dep = pkgDeps_1[_i];
        if (!dep.startsWith('.') && !result[dep]) {
            var depPkg = void 0;
            try {
                depPkg = requireDep.resolve(dep + '/package.json');
            }
            catch (e) { }
            if (depPkg) {
                result[dep] = depPkg;
                var subDeps = getDeps(depPkg, requireDep, result);
                result = __assign({}, result, subDeps);
            }
        }
    }
    return result;
};
exports.default = getDeps;
//# sourceMappingURL=getDeps.js.map