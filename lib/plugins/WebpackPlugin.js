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
var humps = require("humps");
var ip = require("ip");
var path = require("path");
var url = require("url");
var __WINDOWS__ = /^win/.test(process.platform);
var createPlugins = function (builder, spin) {
    var stack = builder.stack;
    var webpack = builder.require('webpack');
    var webpackVer = builder.require('webpack/package.json').version.split('.')[0];
    var buildNodeEnv = process.env.NODE_ENV || (spin.dev ? (spin.test ? 'test' : 'development') : 'production');
    var plugins = [];
    if (spin.dev) {
        if (webpackVer < 4) {
            plugins.push(new webpack.NamedModulesPlugin());
        }
        if (builder.profile) {
            plugins.push(new webpack.debug.ProfilingPlugin({
                outputPath: path.join(builder.require.cwd, stack.hasAny('dll') ? builder.dllBuildDir : builder.buildDir, 'profileEvents.json')
            }));
        }
        if (stack.hasAny(['server', 'web']) && !spin.test) {
            plugins.push(new webpack.HotModuleReplacementPlugin());
            if (webpackVer < 4) {
                plugins.push(new webpack.NoEmitOnErrorsPlugin());
            }
        }
    }
    else {
        if (builder.minify) {
            var uglifyOpts = { test: /\.(js|bundle)(\?.*)?$/i, cache: true, parallel: true };
            if (builder.sourceMap) {
                uglifyOpts.sourceMap = true;
            }
            if (stack.hasAny('angular')) {
                uglifyOpts.mangle = {
                    keep_fname7e8a6ea17be4d30d84376e45f0c76e63b3d23893s7e8a6ea17be4d30d84376e45f0c76e63b3d23893: true
                };
            }
            var UglifyJsPlugin = builder.require('uglifyjs-webpack-plugin');
            plugins.push(new UglifyJsPlugin(uglifyOpts));
        }
        if (webpackVer < 4) {
            plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
        }
    }
    var backendOption = builder.backendUrl;
    var defines = {};
    if (backendOption) {
        defines.__BACKEND_URL__ = "'" + backendOption.replace('{ip}', ip.address()) + "'";
    }
    if (stack.hasAny('dll')) {
        var name = "vendor_" + humps.camelize(builder.parent.name);
        plugins = [
            new webpack.DefinePlugin(__assign({ 'process.env.NODE_ENV': "\"" + buildNodeEnv + "\"" }, defines, builder.defines)),
            new webpack.DllPlugin({
                name: name,
                path: path.join(builder.dllBuildDir, name + "_dll.json")
            })
        ];
    }
    else {
        if (stack.hasAny('server')) {
            plugins = plugins.concat([
                new webpack.BannerPlugin({
                    banner: 'require("source-map-support").install();',
                    raw: true,
                    entryOnly: false
                }),
                new webpack.DefinePlugin(__assign({ __CLIENT__: false, __SERVER__: true, __SSR__: builder.ssr && !spin.test, __DEV__: spin.dev, __TEST__: spin.test, 'process.env.NODE_ENV': "\"" + buildNodeEnv + "\"" }, defines, builder.defines))
            ]);
        }
        else {
            plugins = plugins.concat([
                new webpack.DefinePlugin(__assign({ __CLIENT__: true, __SERVER__: false, __SSR__: builder.ssr && !spin.test, __DEV__: spin.dev, __TEST__: spin.test, 'process.env.NODE_ENV': "\"" + buildNodeEnv + "\"" }, defines, builder.defines))
            ]);
            if (stack.hasAny('web')) {
                var ManifestPlugin = builder.require('webpack-manifest-plugin');
                plugins.push(new ManifestPlugin({
                    fileName: 'assets.json'
                }));
                if (!builder.ssr) {
                    var HtmlWebpackPlugin = builder.require('html-webpack-plugin');
                    plugins.push(new HtmlWebpackPlugin({
                        template: builder.htmlTemplate || path.join(__dirname, '../../html-plugin-template.ejs'),
                        inject: 'body'
                    }));
                }
                if (webpackVer < 4 && !spin.dev) {
                    plugins.push(new webpack.optimize.CommonsChunkPlugin({
                        name: 'vendor',
                        filename: '[name].[hash].js',
                        minChunks: function (module) {
                            return module.resource && module.resource.indexOf(path.join(builder.require.cwd, 'node_modules')) === 0;
                        }
                    }));
                }
            }
        }
    }
    return plugins;
};
var getDepsForNode = function (spin, builder) {
    var pkg = builder.require('./package.json');
    var deps = [];
    for (var _i = 0, _a = Object.keys(pkg.dependencies); _i < _a.length; _i++) {
        var key = _a[_i];
        var val = builder.depPlatforms[key];
        var excluded = false;
        for (var _b = 0, _c = builder.dllExcludes; _b < _c.length; _b++) {
            var regexp = _c[_b];
            if (new RegExp(regexp).test(key)) {
                excluded = true;
            }
        }
        if (!excluded &&
            key.indexOf('@types') !== 0 &&
            (!val || (val.constructor === Array && val.indexOf(builder.parent.name) >= 0) || val === builder.parent.name)) {
            var resolves = builder.require.probe(key);
            var exists = builder.require.probe(key + '/package.json');
            if (resolves && resolves.endsWith('.js')) {
                deps.push(key);
            }
            else if (!resolves && !exists) {
                throw new Error("Cannot find module '" + key + "'");
            }
        }
    }
    return deps;
};
var curWebpackDevPort = 3000;
var webpackPortMap = {};
var createConfig = function (builder, spin) {
    var stack = builder.stack;
    var cwd = process.cwd();
    var webpackVer = builder.require('webpack/package.json').version.split('.')[0];
    var baseConfig = {
        name: builder.name,
        module: {
            rules: [
                webpackVer >= 4
                    ? {
                        test: /\.mjs$/,
                        include: /node_modules/,
                        type: 'javascript/auto'
                    }
                    : {
                        test: /\.mjs$/,
                        include: /node_modules/
                    }
            ]
        },
        resolve: { symlinks: false, cacheWithContext: false },
        watchOptions: {
            ignored: /build/
        },
        bail: !spin.dev,
        stats: {
            hash: false,
            version: false,
            timings: true,
            assets: false,
            chunks: false,
            modules: false,
            reasons: false,
            children: false,
            source: true,
            errors: true,
            errorDetails: true,
            warnings: true,
            publicPath: false,
            colors: true
        },
        output: {}
    };
    if (builder.sourceMap) {
        baseConfig.devtool = spin.dev ? '#cheap-module-source-map' : '#nosources-source-map';
        baseConfig.output.devtoolModuleFilenameTemplate = spin.dev
            ? function (info) { return 'webpack:///./' + path.relative(cwd, info.absoluteResourcePath.split('?')[0]).replace(/\\/g, '/'); }
            : function (info) { return path.relative(cwd, info.absoluteResourcePath); };
    }
    if (webpackVer >= 4) {
        baseConfig.mode = !spin.dev ? 'production' : 'development';
        baseConfig.performance = { hints: false };
        baseConfig.output.pathinfo = false;
    }
    var baseDevServerConfig = {
        hot: true,
        publicPath: '/',
        headers: { 'Access-Control-Allow-Origin': '*' },
        quiet: false,
        noInfo: true,
        historyApiFallback: true
    };
    var plugins = createPlugins(builder, spin);
    var config = __assign({}, baseConfig, { plugins: plugins });
    if (stack.hasAny('server')) {
        config = __assign({}, config, { target: 'node', externals: function (context, request, callback) {
                if (request.indexOf('webpack') < 0 && request.indexOf('babel-polyfill') < 0 && !request.startsWith('.')) {
                    var fullPath = builder.require.probe(request, context);
                    if (fullPath) {
                        var ext = path.extname(fullPath);
                        if (fullPath.indexOf('node_modules') >= 0 && ['.js', '.jsx', '.json'].indexOf(ext) >= 0) {
                            return callback(null, 'commonjs ' + request);
                        }
                    }
                }
                return callback();
            } });
        if (builder.sourceMap) {
            config.output.devtoolModuleFilenameTemplate = spin.dev
                ? function (info) {
                    return info.absoluteResourcePath.indexOf('..') === 0
                        ? path.join(builder.require.cwd, info.absoluteResourcePath)
                        : info.absoluteResourcePath;
                }
                : function (info) { return path.relative(cwd, info.absoluteResourcePath); };
        }
    }
    else {
        config = __assign({}, config, { node: {
                __dirname: true,
                __filename: true,
                fs: 'empty',
                net: 'empty',
                tls: 'empty'
            } });
    }
    if (webpackVer >= 4) {
        if (spin.dev) {
            config = __assign({}, config, { optimization: {
                    removeAvailableModules: false,
                    removeEmptyChunks: false,
                    splitChunks: false
                } });
        }
        else {
            config = __assign({}, config, { optimization: {
                    minimize: builder.minify,
                    concatenateModules: builder.minify,
                    namedModules: true,
                    removeAvailableModules: false,
                    removeEmptyChunks: false,
                    noEmitOnErrors: true
                } });
        }
    }
    if (stack.hasAny('dll')) {
        var name = "vendor_" + humps.camelize(builder.parent.name);
        config = __assign({}, config, { entry: {
                vendor: getDepsForNode(spin, builder)
            }, output: __assign({}, config.output, { filename: name + "_[hash]_dll.js", path: path.join(builder.require.cwd, builder.dllBuildDir), library: name }), bail: true });
        if (stack.hasAny('web')) {
            config.entry.vendor.push('webpack-dev-server/client');
        }
        if (builder.sourceMap) {
            config.devtool = spin.dev ? '#cheap-module-source-map' : '#nosources-source-map';
        }
    }
    else {
        if (spin.dev) {
            config.module.unsafeCache = false;
            config.resolve.unsafeCache = false;
        }
        if (stack.hasAny('server')) {
            var index = [];
            if (spin.dev && !spin.test) {
                if (__WINDOWS__) {
                    index.push('webpack/hot/poll?1000');
                }
                else {
                    index.push('webpack/hot/signal.js');
                }
            }
            index.push(builder.entry || './src/server/index.js');
            config = __assign({}, config, { entry: {
                    index: index
                }, output: __assign({}, config.output, { filename: '[name].js', path: path.join(builder.require.cwd, builder.buildDir || builder.backendBuildDir || 'build/server'), publicPath: '/' }), node: {
                    __dirname: true,
                    __filename: true
                } });
            if (builder.sourceMap && spin.dev) {
                config.output.sourceMapFilename = '[name].[chunkhash].js.map';
            }
        }
        else if (stack.hasAny('web')) {
            var webpackDevPort = void 0;
            if (!builder.webpackDevPort) {
                if (!webpackPortMap[builder.name]) {
                    webpackPortMap[builder.name] = curWebpackDevPort++;
                }
                webpackDevPort = webpackPortMap[builder.name];
            }
            else {
                webpackDevPort = builder.webpackDevPort;
            }
            var webpackDevProtocol = builder.webpackDevProtocol ? builder.webpackDevProtocol : 'http';
            var webpackDevHost = builder.webpackDevHost ? builder.webpackDevHost : 'localhost';
            var webpackDevPortStr = ":" + webpackDevPort;
            if (webpackDevProtocol === 'http' && webpackDevPort === 80) {
                webpackDevPortStr = '';
            }
            if (webpackDevProtocol === 'https' && webpackDevPort === 443) {
                webpackDevPortStr = '';
            }
            var webpackDevURL = webpackDevProtocol + "://" + webpackDevHost + webpackDevPortStr;
            config = __assign({}, config, { entry: {
                    index: (spin.dev ? ['webpack/hot/dev-server', "webpack-dev-server/client?" + webpackDevURL + "/"] : []).concat([
                        builder.entry || './src/client/index.js'
                    ])
                }, output: __assign({}, config.output, { filename: '[name].[hash].js', path: builder.buildDir
                        ? path.join(builder.require.cwd, builder.buildDir)
                        : path.join(builder.require.cwd, builder.frontendBuildDir || 'build/client', 'web'), publicPath: '/' }), devServer: __assign({}, baseDevServerConfig, { port: webpackDevPort }) });
            if (builder.devProxy) {
                var proxyUrl = typeof builder.devProxy === 'string'
                    ? builder.devProxy
                    : builder.backendUrl
                        ? "http://localhost:" + url.parse(builder.backendUrl).port
                        : "http://localhost:8080";
                config.devServer.proxy = {
                    '!(/sockjs-node/**/*|/*.hot-update.{json,js})': {
                        target: proxyUrl,
                        logLevel: 'info',
                        ws: true
                    }
                };
            }
        }
        else if (stack.hasAny('react-native')) {
            config = __assign({}, config, { entry: {
                    index: [builder.entry || './src/mobile/index.js']
                }, output: __assign({}, config.output, { filename: "index.mobile.bundle", publicPath: '/', path: builder.buildDir
                        ? path.join(builder.require.cwd, builder.buildDir)
                        : path.join(builder.require.cwd, builder.frontendBuildDir || 'build/client', builder.name) }), devServer: __assign({}, baseDevServerConfig, { hot: false, port: stack.hasAny('android') ? 3010 : 3020 }) });
        }
        else {
            throw new Error("Unknown platform target: " + stack.platform);
        }
    }
    return config;
};
var WebpackPlugin = (function () {
    function WebpackPlugin() {
    }
    WebpackPlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAny('webpack')) {
            builder.config = builder.config || {};
            builder.config = spin.merge(builder.config, createConfig(builder, spin));
        }
    };
    return WebpackPlugin;
}());
exports.default = WebpackPlugin;
//# sourceMappingURL=WebpackPlugin.js.map