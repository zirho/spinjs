"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var minilog = require("minilog");
var createConfig_1 = require("./createConfig");
minilog.enable();
var logger = minilog('spin');
exports.default = (function (cwd, configPath, builderName) {
    var builder;
    try {
        var builders = createConfig_1.default(cwd, 'watch', { c: configPath }, builderName).builders;
        for (var _i = 0, _a = Object.keys(builders); _i < _a.length; _i++) {
            var builderId = _a[_i];
            if (builders[builderId].name === builderName) {
                builder = builders[builderId];
                break;
            }
        }
    }
    catch (e) {
        if (e.cause) {
            logger.error(e);
        }
        throw e;
    }
    if (!builder) {
        throw new Error("Builder " + builderName + " not found, cwd: " + cwd + ", config path: " + configPath);
    }
    return builder.config;
});
//# sourceMappingURL=createWebpackConfig.js.map