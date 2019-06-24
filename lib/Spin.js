"use strict";
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
var merge = require("webpack-merge");
var Spin = (function () {
    function Spin(cwd, cmd) {
        this.cmd = cmd;
        this.cwd = cwd;
        this.dev = ['watch', 'start', 'test'].indexOf(this.cmd) >= 0;
        this.test = this.cmd === 'test';
        this.watch = ['watch', 'start'].indexOf(this.cmd) >= 0;
    }
    Spin.prototype.createConfig = function (builder, tool, config) {
        var _a = builder[tool + 'Config'] || { merge: {} }, mergeStrategy = _a.merge, configOverrides = __rest(_a, ["merge"]);
        return this.mergeWithStrategy(mergeStrategy, config, configOverrides);
    };
    Spin.prototype.merge = function (config, overrides) {
        return merge.smart(config, overrides);
    };
    Spin.prototype.mergeWithStrategy = function (strategy, config, overrides) {
        return merge.smartStrategy(strategy)(config, overrides);
    };
    return Spin;
}());
exports.default = Spin;
//# sourceMappingURL=Spin.js.map