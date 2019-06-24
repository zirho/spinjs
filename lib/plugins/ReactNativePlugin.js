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
var UPFinder_1 = require("./shared/UPFinder");
var babelRegisterDone = false;
var registerBabel = function (builder) {
    if (!babelRegisterDone) {
        var isBabel7 = builder.require.probe('@babel/core') && builder.require.probe('@babel/preset-flow');
        var babelRegister = isBabel7 ? '@babel/register' : 'babel-register';
        var reactNativePreset = isBabel7 && builder.require.probe('metro-react-native-babel-preset')
            ? 'metro-react-native-babel-preset'
            : 'babel-preset-react-native';
        builder.require(babelRegister)({
            presets: [
                builder.require.resolve(reactNativePreset),
                builder.require.resolve(isBabel7 ? '@babel/preset-flow' : 'babel-preset-flow')
            ],
            ignore: [/node_modules\/(?!haul|react-native)/],
            retainLines: true,
            sourceMaps: 'inline'
        });
        builder.require('babel-polyfill');
        babelRegisterDone = true;
    }
};
var ReactNativePlugin = (function () {
    function ReactNativePlugin() {
    }
    ReactNativePlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['react-native', 'webpack'])) {
            registerBabel(builder);
            var webpack = builder.require('webpack');
            var mobileAssetTest = /\.(bmp|gif|jpg|jpeg|png|psd|svg|webp|m4v|aac|aiff|caf|m4a|mp3|wav|html|pdf|ttf|otf)$/;
            var AssetResolver = builder.require('haul/src/resolvers/AssetResolver');
            var HasteResolver = builder.require('haul/src/resolvers/HasteResolver');
            var babelrc = new UPFinder_1.default(builder).find(['.babelrc.native', 'babel.config.js']);
            var jsRuleFinder_1 = new JSRuleFinder_1.default(builder);
            var jsRule = jsRuleFinder_1.findAndCreateJSRule();
            var cacheDirectory = builder.cache === false || (builder.cache === 'auto' && !spin.dev)
                ? false
                : path.join(builder.cache === true || (builder.cache === 'auto' && spin.dev) ? '.cache' : builder.cache, 'babel-loader');
            var defaultConfig = babelrc && babelrc.endsWith('.babelrc.native')
                ? JSON.parse(fs.readFileSync(babelrc).toString())
                : {
                    compact: !spin.dev,
                    presets: ['expo'].concat(spin.dev ? [] : [['minify', { mangle: false }]]),
                    plugins: ['haul/src/utils/fixRequireIssues']
                };
            builder.config.module.rules.push({
                test: new RegExp('^.*[\\\\\\/]node_modules[\\\\\\/].*\\.' +
                    String(jsRule.test)
                        .split('.')
                        .pop()
                        .slice(0, -1)),
                exclude: /node_modules\/(?!react-native.*|@expo|expo|lottie-react-native|haul|pretty-format|react-navigation|antd-mobile-rn)$/,
                use: {
                    loader: builder.require.probe('heroku-babel-loader') ? 'heroku-babel-loader' : 'babel-loader',
                    options: spin.createConfig(builder, 'babel', babelrc && babelrc.endsWith('.babelrc.native')
                        ? __assign({ babelrc: false, cacheDirectory: cacheDirectory }, defaultConfig) : { babelrc: true, cacheDirectory: cacheDirectory })
                }
            });
            builder.config.resolve.extensions = ["." + stack.platform + ".", '.native.', '.']
                .map(function (prefix) { return jsRuleFinder_1.extensions.map(function (ext) { return prefix + ext; }); })
                .reduce(function (acc, val) { return acc.concat(val); })
                .concat(['.json']);
            var reactVer = builder.require('react-native/package.json').version.split('.')[1] >= 43 ? 16 : 15;
            var polyfillCode = fs
                .readFileSync(require.resolve("../../react-native-polyfills/react-native-polyfill-" + reactVer))
                .toString();
            var VirtualModules = builder.require('webpack-virtual-modules');
            builder.config = spin.merge(builder.config, {
                module: {
                    rules: [
                        { parser: { requireEnsure: false } },
                        {
                            test: mobileAssetTest,
                            use: {
                                loader: 'spinjs/lib/plugins/react-native/assetLoader',
                                options: spin.createConfig(builder, 'asset', {
                                    platform: stack.platform,
                                    root: builder.require.cwd,
                                    cwd: builder.require.cwd,
                                    bundle: false
                                })
                            }
                        }
                    ]
                },
                resolve: {
                    plugins: [
                        new HasteResolver({
                            directories: [path.join(path.dirname(builder.require.resolve('react-native/package.json')), 'Libraries')]
                        }),
                        new AssetResolver({
                            platform: stack.platform,
                            test: mobileAssetTest
                        })
                    ],
                    mainFields: ['react-native', 'browser', 'main']
                },
                plugins: [new VirtualModules({ 'node_modules/@virtual/react-native-polyfill.js': polyfillCode })],
                target: 'webworker'
            });
            if (stack.hasAny('dll')) {
                builder.config = spin.merge(builder.config, {
                    entry: {
                        vendor: ['@virtual/react-native-polyfill']
                    }
                });
            }
            else {
                var idx = builder.config.entry.index.indexOf('babel-polyfill');
                if (idx >= 0) {
                    builder.config.entry.index.splice(idx, 1);
                }
                builder.config = spin.merge({
                    plugins: builder.sourceMap
                        ? [
                            new webpack.SourceMapDevToolPlugin({
                                test: new RegExp("\\.bundle$"),
                                filename: '[file].map'
                            })
                        ]
                        : [],
                    entry: {
                        index: ['@virtual/react-native-polyfill']
                    }
                }, builder.config);
            }
        }
    };
    return ReactNativePlugin;
}());
exports.default = ReactNativePlugin;
//# sourceMappingURL=ReactNativePlugin.js.map