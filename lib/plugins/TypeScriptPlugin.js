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
var JSRuleFinder_1 = require("./shared/JSRuleFinder");
var parallelLoader_1 = require("./shared/parallelLoader");
var TypeScriptPlugin = (function () {
    function TypeScriptPlugin() {
    }
    TypeScriptPlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['ts', 'webpack'])) {
            var atl = builder.require.probe('awesome-typescript-loader');
            var tsChecker = builder.require.probe('fork-ts-checker-webpack-plugin');
            var tsLoaderOpts = {};
            if (!!builder.require.probe('ts-loader')) {
                var verDigits = builder.require('ts-loader/package.json').version.split('.');
                var tsLoaderVer = verDigits[0] * 10 + +verDigits[1];
                tsLoaderOpts = spin.createConfig(builder, 'tsLoader', __assign({ transpileOnly: tsChecker ? true : false, happyPackMode: parallelLoader_1.hasParallelLoalder(builder) ? true : false }, builder.tsLoaderOptions));
                if (tsLoaderVer > 33) {
                    tsLoaderOpts.experimentalWatchApi = true;
                }
            }
            var jsRuleFinder_1 = new JSRuleFinder_1.default(builder);
            var tsRule = jsRuleFinder_1.findAndCreateTSRule();
            tsRule.test = /^(?!.*[\\\/]node_modules[\\\/]).*\.ts$/;
            tsRule.use = parallelLoader_1.addParalleLoaders(builder, spin, [
                atl
                    ? {
                        loader: 'awesome-typescript-loader',
                        options: spin.createConfig(builder, 'awesomeTypescript', __assign({}, builder.tsLoaderOptions, { useCache: true }))
                    }
                    : {
                        loader: 'ts-loader',
                        options: tsLoaderOpts
                    }
            ]);
            if (atl) {
                builder.config = spin.merge(builder.config, {
                    plugins: [new (builder.require('awesome-typescript-loader')).CheckerPlugin()]
                });
            }
            if (tsLoaderOpts.transpileOnly && tsChecker) {
                builder.config = spin.merge(builder.config, {
                    plugins: [
                        new (builder.require('fork-ts-checker-webpack-plugin'))({
                            tsconfig: path.join(builder.require.cwd, 'tsconfig.json'),
                            checkSyntacticErrors: parallelLoader_1.hasParallelLoalder(builder)
                        })
                    ]
                });
            }
            builder.config.resolve.extensions = ['.']
                .map(function (prefix) { return jsRuleFinder_1.extensions.map(function (ext) { return prefix + ext; }); })
                .reduce(function (acc, val) { return acc.concat(val); })
                .concat(['.json']);
            if (!stack.hasAny('dll')) {
                for (var _i = 0, _a = Object.keys(builder.config.entry); _i < _a.length; _i++) {
                    var key = _a[_i];
                    var entry = builder.config.entry[key];
                    for (var idx = 0; idx < entry.length; idx++) {
                        var item = entry[idx];
                        if (['.js', '.jsx', '.ts', '.tsx'].indexOf(path.extname(item)) >= 0 && item.indexOf('node_modules') < 0) {
                            var baseItem = path.join(path.dirname(item), path.basename(item, path.extname(item)));
                            for (var _b = 0, _c = ['.js', '.jsx', '.ts', '.tsx']; _b < _c.length; _b++) {
                                var ext = _c[_b];
                                if (fs.existsSync(baseItem + ext)) {
                                    entry[idx] = (baseItem.startsWith('.') ? '' : './') + baseItem + ext;
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    return TypeScriptPlugin;
}());
exports.default = TypeScriptPlugin;
//# sourceMappingURL=TypeScriptPlugin.js.map