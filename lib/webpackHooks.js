"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var humps_1 = require("humps");
var webpackHook = function (hookType, compiler, hookName, hookFunc) {
    if (compiler.hooks) {
        var hook = compiler.hooks[humps_1.camelize(hookName)];
        if (hookType === 'async') {
            hook.tapAsync('SpinJS', hookFunc);
        }
        else {
            hook.tap('SpinJS', hookFunc);
        }
    }
    else {
        compiler.plugin(hookName, hookFunc);
    }
};
exports.hookSync = function (compiler, hookName, hookFunc) {
    return webpackHook('sync', compiler, hookName, hookFunc);
};
exports.hookAsync = function (compiler, hookName, hookFunc) {
    return webpackHook('async', compiler, hookName, hookFunc);
};
//# sourceMappingURL=webpackHooks.js.map