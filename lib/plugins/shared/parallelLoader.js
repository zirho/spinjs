"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
var path = require("path");
exports.hasParallelLoalder = function (builder) {
    return !!builder.require.probe('thread-loader');
};
exports.addParalleLoaders = function (builder, spin, compilerRules) {
    var cacheLoader = builder.require.probe('cache-loader');
    var threadLoader = builder.require.probe('thread-loader');
    var result = compilerRules.slice(0);
    if (threadLoader) {
        result.unshift({
            loader: 'thread-loader',
            options: spin.createConfig(builder, 'threadLoader', {
                workers: os.cpus().length - 1
            })
        });
    }
    if (cacheLoader && !!builder.cache) {
        result.unshift({
            loader: 'cache-loader',
            options: spin.createConfig(builder, 'cacheLoader', {
                cacheDirectory: path.join(typeof builder.cache === 'string' && builder.cache !== 'auto' ? builder.cache : '.cache', 'cache-loader')
            })
        });
    }
    return result;
};
//# sourceMappingURL=parallelLoader.js.map