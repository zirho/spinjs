"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var cluster = require("cluster");
var cors = require("connect-cors");
var crypto = require("crypto");
var Debug = require("debug");
var detectPort = require("detect-port");
var fs = require("fs");
var http = require("http");
var humps = require("humps");
var ip = require("ip");
var isDocker = require("is-docker");
var _ = require("lodash");
var minilog = require("minilog");
var mkdirp = require("mkdirp");
var path = require("path");
var serveStatic = require("serve-static");
var source_list_map_1 = require("source-list-map");
var url = require("url");
var webpack_sources_1 = require("webpack-sources");
var liveReloadMiddleware_1 = require("./plugins/react-native/liveReloadMiddleware");
var symbolicateMiddleware_1 = require("./plugins/react-native/symbolicateMiddleware");
var Spin_1 = require("./Spin");
var webpackHooks_1 = require("./webpackHooks");
var SPIN_DLL_VERSION = 2;
var BACKEND_CHANGE_MSG = 'backend_change';
var debug = Debug('spinjs');
var expoPorts = {};
var clientStats = { all: false, assets: true, warnings: true, errors: true, errorDetails: false };
var spinLogger = minilog('spin');
process.on('uncaughtException', function (ex) {
    spinLogger.error(ex);
});
process.on('unhandledRejection', function (reason) {
    spinLogger.error(reason);
});
var __WINDOWS__ = /^win/.test(process.platform);
var server;
var startBackend = false;
var nodeDebugOpt;
process.on('exit', function () {
    if (server) {
        server.kill('SIGTERM');
    }
});
var spawnServer = function (cwd, args, options, logger) {
    server = child_process_1.spawn('node', args.slice(), { stdio: [0, 1, 2], cwd: cwd });
    logger.debug("Spawning " + ['node'].concat(args).join(' '));
    server.on('exit', function (code) {
        if (code === 250) {
            startBackend = true;
        }
        logger.info('Backend has been stopped');
        server = undefined;
        runServer(cwd, options.serverPath, options.nodeDebugger, logger);
    });
};
var runServer = function (cwd, serverPath, nodeDebugger, logger) {
    if (!fs.existsSync(serverPath)) {
        throw new Error("Backend doesn't exist at " + serverPath + ", exiting");
    }
    if (startBackend) {
        startBackend = false;
        logger.debug('Starting backend');
        if (!nodeDebugOpt) {
            if (!nodeDebugger) {
                spawnServer(cwd, [serverPath], { serverPath: serverPath, nodeDebugger: nodeDebugger }, logger);
            }
            else {
                child_process_1.exec('node -v', function (error, stdout, stderr) {
                    if (error) {
                        spinLogger.error(error);
                        process.exit(1);
                    }
                    var nodeVersion = stdout.match(/^v([0-9]+)\.([0-9]+)\.([0-9]+)/);
                    var nodeMajor = parseInt(nodeVersion[1], 10);
                    var nodeMinor = parseInt(nodeVersion[2], 10);
                    nodeDebugOpt = nodeMajor >= 6 || (nodeMajor === 6 && nodeMinor >= 9) ? '--inspect' : '--debug';
                    detectPort(9229).then(function (debugPort) {
                        var debugHost = isDocker() ? '0.0.0.0:' : '';
                        spawnServer(cwd, [nodeDebugOpt + '=' + debugHost + debugPort, serverPath], { serverPath: serverPath, nodeDebugger: nodeDebugger }, logger);
                    });
                });
            }
        }
        else {
            spawnServer(cwd, [nodeDebugOpt, serverPath], { serverPath: serverPath, nodeDebugger: nodeDebugger }, logger);
        }
    }
};
var webpackReporter = function (spin, builder, outputPath, log, err, stats) {
    if (err) {
        log.error(err.stack);
        throw new Error('Build error');
    }
    if (stats) {
        var str = stats.toString(builder.config.stats);
        if (str.length > 0) {
            log.info(str);
        }
        if (builder.writeStats) {
            mkdirp.sync(outputPath);
            fs.writeFileSync(path.join(outputPath, 'stats.json'), JSON.stringify(stats.toJson(clientStats)));
        }
    }
    if (!spin.watch && cluster.isWorker) {
        log.info('Build process finished, exitting...');
        process.exit(0);
    }
};
var frontendVirtualModules = [];
var MobileAssetsPlugin = (function () {
    function MobileAssetsPlugin(vendorAssets) {
        this.vendorAssets = vendorAssets || [];
    }
    MobileAssetsPlugin.prototype.apply = function (compiler) {
        var _this = this;
        webpackHooks_1.hookAsync(compiler, 'after-compile', function (compilation, callback) {
            compilation.chunks.forEach(function (chunk) {
                chunk.files.forEach(function (file) {
                    if (file.endsWith('.bundle')) {
                        var assets_1 = _this.vendorAssets;
                        compilation.modules.forEach(function (module) {
                            if (module._asset) {
                                assets_1.push(module._asset);
                            }
                        });
                        compilation.assets[file.replace('.bundle', '') + '.assets'] = new webpack_sources_1.RawSource(JSON.stringify(assets_1));
                    }
                });
            });
            callback();
        });
    };
    return MobileAssetsPlugin;
}());
var startClientWebpack = function (hasBackend, spin, builder) {
    var webpack = builder.require('webpack');
    var config = builder.config;
    var configOutputPath = config.output.path;
    var VirtualModules = builder.require('webpack-virtual-modules');
    var clientVirtualModules = new VirtualModules({ 'node_modules/backend_reload.js': '' });
    config.plugins.push(clientVirtualModules);
    frontendVirtualModules.push(clientVirtualModules);
    var logger = minilog(config.name + "-webpack");
    if (builder.silent) {
        logger.suggest.deny(/.*/, 'debug');
    }
    try {
        var reporter = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return webpackReporter.apply(void 0, [spin, builder, configOutputPath, logger].concat(args));
        };
        if (spin.watch) {
            startWebpackDevServer(hasBackend, spin, builder, reporter, logger);
        }
        else {
            if (builder.stack.platform !== 'web') {
                config.plugins.push(new MobileAssetsPlugin());
            }
            var compiler = webpack(config);
            compiler.run(reporter);
        }
    }
    catch (err) {
        logger.error(err.message, err.stack);
    }
};
var backendReloadCount = 0;
var increaseBackendReloadCount = function () {
    backendReloadCount++;
    for (var _i = 0, frontendVirtualModules_1 = frontendVirtualModules; _i < frontendVirtualModules_1.length; _i++) {
        var virtualModules = frontendVirtualModules_1[_i];
        virtualModules.writeModule('node_modules/backend_reload.js', "var count = " + backendReloadCount + ";\n");
    }
};
var startServerWebpack = function (spin, builder) {
    var config = builder.config;
    var logger = minilog(config.name + "-webpack");
    if (builder.silent) {
        logger.suggest.deny(/.*/, 'debug');
    }
    try {
        var webpack = builder.require('webpack');
        var reporter = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return webpackReporter.apply(void 0, [spin, builder, config.output.path, logger].concat(args));
        };
        var compiler = webpack(config);
        if (spin.watch) {
            webpackHooks_1.hookSync(compiler, 'done', function (stats) {
                if (stats.compilation.errors && stats.compilation.errors.length) {
                    stats.compilation.errors.forEach(function (error) { return logger.error(error.message); });
                }
            });
            webpackHooks_1.hookSync(compiler, 'compilation', function (compilation) {
                webpackHooks_1.hookSync(compilation, 'after-optimize-assets', function (assets) {
                    var mapKey = _.findKey(assets, function (v, k) { return k.endsWith('.map'); });
                    if (mapKey) {
                        var srcMap = JSON.parse(assets[mapKey]._value);
                        for (var _i = 0, _a = Object.keys(srcMap.sources); _i < _a.length; _i++) {
                            var idx = _a[_i];
                            srcMap.sources[idx] = srcMap.sources[idx].split(';')[0];
                        }
                        assets[mapKey]._value = JSON.stringify(srcMap);
                    }
                });
            });
            compiler.watch({}, reporter);
            webpackHooks_1.hookSync(compiler, 'done', function (stats) {
                if (!stats.compilation.errors.length) {
                    var output = config.output;
                    startBackend = true;
                    if (server) {
                        if (!__WINDOWS__) {
                            server.kill('SIGUSR2');
                        }
                        if (builder.frontendRefreshOnBackendChange) {
                            for (var _i = 0, _a = stats.compilation.modules; _i < _a.length; _i++) {
                                var module_1 = _a[_i];
                                if (module_1.built && module_1.resource && module_1.resource.split(/[\\\/]/).indexOf('server') >= 0) {
                                    logger.debug('Force front-end current page refresh, due to change in backend at:', module_1.resource);
                                    process.send({ cmd: BACKEND_CHANGE_MSG });
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        runServer(builder.require.cwd, path.join(output.path, 'index.js'), builder.nodeDebugger, logger);
                    }
                }
            });
        }
        else {
            compiler.run(reporter);
        }
    }
    catch (err) {
        logger.error(err.message, err.stack);
    }
};
var openFrontend = function (spin, builder, logger) {
    var opn = builder.require('opn');
    try {
        if (builder.stack.hasAny('web')) {
            var lanUrl = "http://" + ip.address() + ":" + builder.config.devServer.port;
            var localUrl = "http://localhost:" + builder.config.devServer.port;
            if (isDocker() || builder.openBrowser === false) {
                logger.info("App is running at, Local: " + localUrl + " LAN: " + lanUrl);
            }
            else {
                opn(localUrl);
            }
        }
        else if (builder.stack.hasAny('react-native')) {
            startExpoProject(spin, builder, logger);
        }
    }
    catch (e) {
        logger.error(e.stack);
    }
};
var debugMiddleware = function (req, res, next) {
    if (['/debug', '/debug/bundles'].indexOf(req.path) >= 0) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<!doctype html><div><a href="/debug/bundles">Cached Bundles</a></div>');
    }
    else {
        next();
    }
};
var startWebpackDevServer = function (hasBackend, spin, builder, reporter, logger) {
    var webpack = builder.require('webpack');
    var config = builder.config;
    var platform = builder.stack.platform;
    var configOutputPath = config.output.path;
    config.output.path = '/';
    var vendorHashesJson;
    var vendorSourceListMap;
    var vendorSource;
    var vendorMap;
    if (builder.webpackDll && builder.child) {
        var name = "vendor_" + humps.camelize(builder.name);
        var jsonPath = path.join(builder.dllBuildDir, name + "_dll.json");
        var json = JSON.parse(fs.readFileSync(path.resolve('./' + jsonPath)).toString());
        config.plugins.push(new webpack.DllReferencePlugin({
            context: process.cwd(),
            manifest: json
        }));
        vendorHashesJson = JSON.parse(fs.readFileSync(path.join(builder.dllBuildDir, name + "_dll_hashes.json")).toString());
        vendorSource = new webpack_sources_1.RawSource(fs.readFileSync(path.join(builder.dllBuildDir, vendorHashesJson.name)).toString() + '\n');
        if (platform !== 'web') {
            var vendorAssets = JSON.parse(fs.readFileSync(path.join(builder.dllBuildDir, vendorHashesJson.name + '.assets')).toString());
            config.plugins.push(new MobileAssetsPlugin(vendorAssets));
        }
        if (builder.sourceMap) {
            vendorMap = new webpack_sources_1.RawSource(fs.readFileSync(path.join(builder.dllBuildDir, vendorHashesJson.name + '.map')).toString());
            vendorSourceListMap = source_list_map_1.fromStringWithSourceMap(vendorSource.source(), JSON.parse(vendorMap.source()));
        }
    }
    var compiler = webpack(config);
    var awaitedAlready = false;
    webpackHooks_1.hookAsync(compiler, 'after-emit', function (compilation, callback) {
        if (!awaitedAlready) {
            if (hasBackend || builder.waitOn) {
                var waitOnUrls_1;
                var backendOption = builder.backendUrl || builder.backendUrl;
                if (backendOption) {
                    var _a = url.parse(backendOption.replace('{ip}', ip.address())), protocol = _a.protocol, hostname = _a.hostname, port = _a.port;
                    waitOnUrls_1 = ["tcp:" + hostname + ":" + (port || (protocol === 'https:' ? 443 : 80))];
                }
                else {
                    waitOnUrls_1 = builder.waitOn ? [].concat(builder.waitOn) : undefined;
                }
                if (waitOnUrls_1 && waitOnUrls_1.length) {
                    logger.debug("waiting for " + waitOnUrls_1);
                    var waitStart_1 = Date.now();
                    var waitNotifier_1 = setInterval(function () {
                        logger.debug("still waiting for " + waitOnUrls_1 + " after " + (Date.now() - waitStart_1) + "ms...");
                    }, 10000);
                    var waitOn = builder.require('wait-on');
                    waitOn({ resources: waitOnUrls_1 }, function (err) {
                        clearInterval(waitNotifier_1);
                        awaitedAlready = true;
                        if (err) {
                            logger.error(err);
                        }
                        else {
                            logger.debug('Backend has been started, resuming webpack dev server...');
                        }
                        callback();
                    });
                }
                else {
                    awaitedAlready = true;
                    callback();
                }
            }
            else {
                callback();
            }
        }
        else {
            callback();
        }
    });
    if (builder.webpackDll && builder.child && platform !== 'web') {
        webpackHooks_1.hookAsync(compiler, 'after-compile', function (compilation, callback) {
            compilation.chunks.forEach(function (chunk) {
                chunk.files.forEach(function (file) {
                    if (file.endsWith('.bundle')) {
                        if (builder.sourceMap) {
                            var sourceListMap = new source_list_map_1.SourceListMap();
                            sourceListMap.add(vendorSourceListMap);
                            sourceListMap.add(source_list_map_1.fromStringWithSourceMap(compilation.assets[file].source(), JSON.parse(compilation.assets[file + '.map'].source())));
                            var sourceAndMap = sourceListMap.toStringWithSourceMap({ file: file });
                            compilation.assets[file] = new webpack_sources_1.RawSource(sourceAndMap.source);
                            compilation.assets[file + '.map'] = new webpack_sources_1.RawSource(JSON.stringify(sourceAndMap.map));
                        }
                        else {
                            compilation.assets[file] = new webpack_sources_1.ConcatSource(vendorSource, compilation.assets[file]);
                        }
                    }
                });
            });
            callback();
        });
    }
    if (builder.webpackDll && builder.child && platform === 'web' && !builder.ssr) {
        webpackHooks_1.hookAsync(compiler, 'after-compile', function (compilation, callback) {
            compilation.assets[vendorHashesJson.name] = vendorSource;
            if (builder.sourceMap) {
                compilation.assets[vendorHashesJson.name + '.map'] = vendorMap;
            }
            callback();
        });
        webpackHooks_1.hookSync(compiler, 'compilation', function (compilation) {
            webpackHooks_1.hookAsync(compilation, 'html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {
                htmlPluginData.assets.js.unshift('/' + vendorHashesJson.name);
                callback(null, htmlPluginData);
            });
        });
    }
    var frontendFirstStart = true;
    webpackHooks_1.hookSync(compiler, 'done', function (stats) {
        var dir = configOutputPath;
        mkdirp.sync(dir);
        if (stats.compilation.assets['assets.json']) {
            var assetsMap_1 = JSON.parse(stats.compilation.assets['assets.json'].source());
            var prefix_1 = compiler.outputPath;
            _.each(stats.toJson(clientStats).assetsByChunkName, function (assets, bundle) {
                var bundleJs = assets.constructor === Array ? assets[0] : assets;
                assetsMap_1[bundle + ".js"] = prefix_1 + bundleJs;
                if (assets.length > 1) {
                    assetsMap_1[bundle + ".js.map"] = prefix_1 + (bundleJs + ".map");
                }
            });
            if (builder.webpackDll) {
                assetsMap_1['vendor.js'] = prefix_1 + vendorHashesJson.name;
            }
            fs.writeFileSync(path.join(dir, 'assets.json'), JSON.stringify(assetsMap_1));
        }
        if (frontendFirstStart) {
            frontendFirstStart = false;
            openFrontend(spin, builder, logger);
        }
    });
    var serverInstance;
    var webSocketProxy;
    var messageSocket;
    var wsProxy;
    var ms;
    var inspectorProxy;
    if (platform === 'web') {
        var WebpackDevServer = builder.require('webpack-dev-server');
        serverInstance = new WebpackDevServer(compiler, __assign({}, config.devServer, { reporter: function (opts1, opts2) {
                var opts = opts2 || opts1;
                var state = opts.state, stats = opts.stats;
                if (state) {
                    logger.debug('bundle is now VALID.');
                }
                else {
                    logger.debug('bundle is now INVALID.');
                }
                reporter(null, stats);
            } }));
    }
    else {
        var connect = builder.require('connect');
        var compression = builder.require('compression');
        var httpProxyMiddleware_1 = builder.require('http-proxy-middleware');
        var mime = builder.require('mime', builder.require.resolve('webpack-dev-middleware'));
        var webpackDevMiddleware = builder.require('webpack-dev-middleware');
        var webpackHotMiddleware = builder.require('webpack-hot-middleware');
        var app_1 = connect();
        serverInstance = http.createServer(app_1);
        mime.define({ 'application/javascript': ['bundle'] }, true);
        mime.define({ 'application/json': ['assets'] }, true);
        messageSocket = builder.require('react-native/local-cli/server/util/messageSocket.js');
        webSocketProxy = builder.require('react-native/local-cli/server/util/webSocketProxy.js');
        try {
            var InspectorProxy = builder.require('react-native/local-cli/server/util/inspectorProxy.js');
            inspectorProxy = new InspectorProxy();
        }
        catch (ignored) { }
        var copyToClipBoardMiddleware = builder.require('react-native/local-cli/server/middleware/copyToClipBoardMiddleware');
        var cpuProfilerMiddleware = void 0;
        try {
            cpuProfilerMiddleware = builder.require('react-native/local-cli/server/middleware/cpuProfilerMiddleware');
        }
        catch (ignored) { }
        var getDevToolsMiddleware = builder.require('react-native/local-cli/server/middleware/getDevToolsMiddleware');
        var heapCaptureMiddleware = void 0;
        try {
            heapCaptureMiddleware = builder.require('react-native/local-cli/server/middleware/heapCaptureMiddleware.js');
        }
        catch (ignored) { }
        var indexPageMiddleware = builder.require('react-native/local-cli/server/middleware/indexPage');
        var loadRawBodyMiddleware = builder.require('react-native/local-cli/server/middleware/loadRawBodyMiddleware');
        var openStackFrameInEditorMiddleware = builder.require('react-native/local-cli/server/middleware/openStackFrameInEditorMiddleware');
        var statusPageMiddleware = builder.require('react-native/local-cli/server/middleware/statusPageMiddleware.js');
        var systraceProfileMiddleware = builder.require('react-native/local-cli/server/middleware/systraceProfileMiddleware.js');
        var unless = builder.require('react-native/local-cli/server/middleware/unless');
        compiler.options.output.path = path.sep;
        var devMiddleware_1 = webpackDevMiddleware(compiler, _.merge({}, config.devServer, {
            reporter: function (mwOpts, _a) {
                var state = _a.state, stats = _a.stats;
                if (state) {
                    logger.info('bundle is now VALID.');
                }
                else {
                    logger.info('bundle is now INVALID.');
                }
                reporter(null, stats);
            }
        }));
        var args = {
            port: config.devServer.port,
            projectRoots: [path.resolve('.')]
        };
        app_1
            .use(cors())
            .use(loadRawBodyMiddleware)
            .use(function (req, res, next) {
            req.path = req.url.split('?')[0];
            if (req.path === '/symbolicate') {
                req.rawBody = req.rawBody.replace(/index\.mobile\.delta/g, 'index.mobile.bundle');
            }
            var origWriteHead = res.writeHead;
            res.writeHead = function () {
                var parms = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    parms[_i] = arguments[_i];
                }
                var code = parms[0];
                if (code === 404) {
                    logger.error("404 at URL " + req.url);
                }
                origWriteHead.apply(res, parms);
            };
            if (debug.enabled && req.path !== '/onchange') {
                logger.debug("Dev mobile packager request: " + (debug.enabled ? req.url : req.path));
            }
            next();
        })
            .use(function (req, res, next) {
            var query = url.parse(req.url, true).query;
            var urlPlatform = query && query.platform;
            if (urlPlatform && urlPlatform !== builder.stack.platform) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end("Serving '" + builder.stack.platform + "' bundles, but got request from '" + urlPlatform + "'");
            }
            else {
                next();
            }
        })
            .use(compression());
        app_1.use('/assets', serveStatic(path.join(builder.require.cwd, '.expo', builder.stack.platform)));
        if (builder.child) {
            app_1.use(serveStatic(builder.child.config.output.path));
        }
        app_1
            .use(function (req, res, next) {
            if (req.path === '/debugger-ui/deltaUrlToBlobUrl.js') {
                debug("serving monkey patched deltaUrlToBlobUrl");
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end("window.deltaUrlToBlobUrl = function(url) { return url.replace('.delta', '.bundle'); }");
            }
            else {
                next();
            }
        })
            .use('/debugger-ui', serveStatic(path.join(path.dirname(builder.require.resolve('react-native/package.json')), '/local-cli/server/util/debugger-ui')))
            .use(getDevToolsMiddleware(args, function () { return wsProxy && wsProxy.isChromeConnected(); }))
            .use(getDevToolsMiddleware(args, function () { return ms && ms.isChromeConnected(); }))
            .use(liveReloadMiddleware_1.default(compiler))
            .use(symbolicateMiddleware_1.default(compiler, logger))
            .use(openStackFrameInEditorMiddleware(args))
            .use(copyToClipBoardMiddleware)
            .use(statusPageMiddleware)
            .use(systraceProfileMiddleware)
            .use(indexPageMiddleware)
            .use(debugMiddleware);
        if (heapCaptureMiddleware) {
            app_1.use(heapCaptureMiddleware);
        }
        if (cpuProfilerMiddleware) {
            app_1.use(cpuProfilerMiddleware);
        }
        if (inspectorProxy) {
            app_1.use(unless('/inspector', inspectorProxy.processRequest.bind(inspectorProxy)));
        }
        app_1
            .use(function (req, res, next) {
            if (platform !== 'web') {
                var origSetHeader_1 = res.setHeader;
                res.setHeader = function (key, value) {
                    var val = value;
                    if (key === 'Content-Type' && value.indexOf('application/javascript') >= 0) {
                        val = value.split(';')[0];
                    }
                    origSetHeader_1.call(res, key, val);
                };
            }
            return devMiddleware_1(req, res, next);
        })
            .use(webpackHotMiddleware(compiler, { log: false }));
        if (config.devServer.proxy) {
            Object.keys(config.devServer.proxy).forEach(function (key) {
                app_1.use(httpProxyMiddleware_1(key, config.devServer.proxy[key]));
            });
        }
    }
    logger.info("Webpack dev server listening on http://localhost:" + config.devServer.port);
    serverInstance.listen(config.devServer.port, function () {
        if (platform !== 'web') {
            wsProxy = webSocketProxy.attachToServer(serverInstance, '/debugger-proxy');
            ms = messageSocket.attachToServer(serverInstance, '/message');
            webSocketProxy.attachToServer(serverInstance, '/devtools');
            if (inspectorProxy) {
                inspectorProxy.attachToServer(serverInstance, '/inspector');
            }
        }
    });
    serverInstance.timeout = 0;
    serverInstance.keepAliveTimeout = 0;
};
var isDllValid = function (spin, builder, logger) {
    var name = "vendor_" + humps.camelize(builder.name);
    try {
        var hashesPath = path.join(builder.dllBuildDir, name + "_dll_hashes.json");
        if (!fs.existsSync(hashesPath)) {
            return false;
        }
        var relMeta = JSON.parse(fs.readFileSync(hashesPath).toString());
        if (SPIN_DLL_VERSION !== relMeta.version) {
            return false;
        }
        if (!fs.existsSync(path.join(builder.dllBuildDir, relMeta.name))) {
            return false;
        }
        if (builder.sourceMap && !fs.existsSync(path.join(builder.dllBuildDir, relMeta.name + '.map'))) {
            return false;
        }
        if (!_.isEqual(relMeta.modules, builder.child.config.entry.vendor)) {
            return false;
        }
        var json = JSON.parse(fs.readFileSync(path.join(builder.dllBuildDir, name + "_dll.json")).toString());
        for (var _i = 0, _a = Object.keys(json.content); _i < _a.length; _i++) {
            var filename = _a[_i];
            if (filename.indexOf(' ') < 0 && filename.indexOf('@virtual') < 0) {
                if (!fs.existsSync(filename)) {
                    logger.warn(name + " DLL need to be regenerated, file: " + filename + " is missing.");
                    return false;
                }
                var hash = crypto
                    .createHash('md5')
                    .update(fs.readFileSync(filename))
                    .digest('hex');
                if (relMeta.hashes[filename] !== hash) {
                    logger.warn("Hash for " + name + " DLL file " + filename + " has changed, need to rebuild it");
                    return false;
                }
            }
        }
        return true;
    }
    catch (e) {
        logger.warn("Error checking vendor bundle " + name + ", regenerating it...", e);
        return false;
    }
};
var buildDll = function (spin, builder) {
    var webpack = builder.require('webpack');
    var config = builder.child.config;
    return new Promise(function (done) {
        var name = "vendor_" + humps.camelize(builder.name);
        var logger = minilog(config.name + "-webpack");
        if (builder.silent) {
            logger.suggest.deny(/.*/, 'debug');
        }
        var reporter = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return webpackReporter.apply(void 0, [spin, builder, config.output.path, logger].concat(args));
        };
        if (!isDllValid(spin, builder, logger)) {
            logger.debug("Generating " + name + " DLL bundle with modules:\n" + JSON.stringify(config.entry.vendor));
            mkdirp.sync(builder.dllBuildDir);
            var compiler = webpack(config);
            webpackHooks_1.hookSync(compiler, 'done', function (stats) {
                try {
                    var json = JSON.parse(fs.readFileSync(path.join(builder.dllBuildDir, name + "_dll.json")).toString());
                    var vendorKey = _.findKey(stats.compilation.assets, function (v, key) { return key.startsWith('vendor') && key.endsWith('_dll.js'); });
                    var assets_2 = [];
                    stats.compilation.modules.forEach(function (module) {
                        if (module._asset) {
                            assets_2.push(module._asset);
                        }
                    });
                    fs.writeFileSync(path.join(builder.dllBuildDir, vendorKey + ".assets"), JSON.stringify(assets_2));
                    var meta = { name: vendorKey, hashes: {}, modules: config.entry.vendor, version: SPIN_DLL_VERSION };
                    for (var _i = 0, _a = Object.keys(json.content); _i < _a.length; _i++) {
                        var filename = _a[_i];
                        if (filename.indexOf(' ') < 0 && filename.indexOf('@virtual') < 0) {
                            meta.hashes[filename] = crypto
                                .createHash('md5')
                                .update(fs.readFileSync(filename))
                                .digest('hex');
                        }
                    }
                    fs.writeFileSync(path.join(builder.dllBuildDir, name + "_dll_hashes.json"), JSON.stringify(meta));
                    fs.writeFileSync(path.join(builder.dllBuildDir, name + "_dll.json"), JSON.stringify(json));
                }
                catch (e) {
                    logger.error(e.stack);
                    process.exit(1);
                }
                done();
            });
            compiler.run(reporter);
        }
        else {
            done();
        }
    });
};
var copyExpoImage = function (cwd, expoDir, appJson, keyPath) {
    var imagePath = _.get(appJson, keyPath);
    if (imagePath) {
        var absImagePath = path.join(cwd, imagePath);
        fs.writeFileSync(path.join(expoDir, path.basename(absImagePath)), fs.readFileSync(absImagePath));
        _.set(appJson, keyPath, path.basename(absImagePath));
    }
};
var setupExpoDir = function (spin, builder, dir, platform) {
    var reactNativeDir = path.join(dir, 'node_modules', 'react-native');
    mkdirp.sync(path.join(reactNativeDir, 'local-cli'));
    fs.writeFileSync(path.join(reactNativeDir, 'package.json'), fs.readFileSync(builder.require.resolve('react-native/package.json')));
    fs.writeFileSync(path.join(reactNativeDir, 'local-cli/cli.js'), '');
    var reactDir = path.join(dir, 'node_modules', 'react');
    mkdirp.sync(reactDir);
    fs.writeFileSync(path.join(reactDir, 'package.json'), fs.readFileSync(builder.require.resolve('react/package.json')));
    var pkg = JSON.parse(fs.readFileSync(builder.require.resolve('./package.json')).toString());
    var origDeps = pkg.dependencies;
    delete pkg.devDependencies;
    pkg.dependencies = { react: origDeps.react, 'react-native': origDeps['react-native'] };
    if (platform !== 'all') {
        pkg.name = pkg.name + '-' + platform;
    }
    pkg.main = "index.mobile";
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
    var appJson = JSON.parse(fs.readFileSync(builder.require.resolve('./app.json')).toString());
    [
        'expo.icon',
        'expo.ios.icon',
        'expo.android.icon',
        'expo.splash.image',
        'expo.ios.splash.image',
        'expo.ios.splash.tabletImage',
        'expo.android.splash.ldpi',
        'expo.android.splash.mdpi',
        'expo.android.splash.hdpi',
        'expo.android.splash.xhdpi',
        'expo.android.splash.xxhdpi',
        'expo.android.splash.xxxhdpi'
    ].forEach(function (keyPath) { return copyExpoImage(builder.require.cwd, dir, appJson, keyPath); });
    fs.writeFileSync(path.join(dir, 'app.json'), JSON.stringify(appJson, null, 2));
    if (platform !== 'all') {
        fs.writeFileSync(path.join(dir, '.exprc'), JSON.stringify({ manifestPort: expoPorts[platform] }, null, 2));
    }
};
var deviceLoggers = {};
var mirrorExpoLogs = function (builder, projectRoot) {
    var bunyan = builder.require('@expo/bunyan');
    if (!bunyan._patched) {
        deviceLoggers[projectRoot] = minilog('expo-for-' + builder.name);
        var origCreate_1 = bunyan.createLogger;
        bunyan.createLogger = function (opts) {
            var logger = origCreate_1.call(bunyan, opts);
            var origChild = logger.child;
            logger.child = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var child = origChild.apply(logger, args);
                var patched = __assign({}, child);
                var _loop_1 = function (name) {
                    patched[name] = function () {
                        var logArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            logArgs[_i] = arguments[_i];
                        }
                        var obj = logArgs[0], msg = logArgs[1];
                        if (!obj.issueCleared) {
                            var message = void 0;
                            try {
                                var json = JSON.parse(msg);
                                message = json.stack ? json.message + '\n' + json.stack : json.message;
                            }
                            catch (e) { }
                            message = message || msg || obj;
                            deviceLoggers[projectRoot][name].apply(deviceLoggers[projectRoot], [message]);
                            child[name].call(child, logArgs);
                        }
                    };
                };
                for (var _a = 0, _b = ['info', 'debug', 'warn', 'error']; _a < _b.length; _a++) {
                    var name = _b[_a];
                    _loop_1(name);
                }
                return patched;
            };
            return logger;
        };
        bunyan._patched = true;
    }
};
var startExpoServer = function (spin, builder, projectRoot, packagerPort) { return __awaiter(_this, void 0, void 0, function () {
    var _a, Config, Project, ProjectSettings;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = builder.require('xdl'), Config = _a.Config, Project = _a.Project, ProjectSettings = _a.ProjectSettings;
                mirrorExpoLogs(builder, projectRoot);
                Config.validation.reactNativeVersionWarnings = false;
                Config.developerTool = 'crna';
                Config.offline = true;
                return [4, Project.startExpoServerAsync(projectRoot)];
            case 1:
                _b.sent();
                return [4, ProjectSettings.setPackagerInfoAsync(projectRoot, {
                        packagerPort: packagerPort
                    })];
            case 2:
                _b.sent();
                return [2];
        }
    });
}); };
var startExpoProject = function (spin, builder, logger) { return __awaiter(_this, void 0, void 0, function () {
    var _a, UrlUtils, Android, Simulator, qr, platform, projectRoot, address, localAddress, _b, success, error, _c, success, msg, e_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = builder.require('xdl'), UrlUtils = _a.UrlUtils, Android = _a.Android, Simulator = _a.Simulator;
                qr = builder.require('qrcode-terminal');
                platform = builder.stack.platform;
                _d.label = 1;
            case 1:
                _d.trys.push([1, 9, , 10]);
                projectRoot = path.join(builder.require.cwd, '.expo', platform);
                setupExpoDir(spin, builder, projectRoot, platform);
                return [4, startExpoServer(spin, builder, projectRoot, builder.config.devServer.port)];
            case 2:
                _d.sent();
                return [4, UrlUtils.constructManifestUrlAsync(projectRoot)];
            case 3:
                address = _d.sent();
                return [4, UrlUtils.constructManifestUrlAsync(projectRoot, {
                        hostType: 'localhost'
                    })];
            case 4:
                localAddress = _d.sent();
                logger.info("Expo address for " + platform + ", Local: " + localAddress + ", LAN: " + address);
                logger.info("To open this app on your phone scan this QR code in Expo Client (if it doesn't get started automatically)");
                qr.generate(address, function (code) {
                    logger.info('\n' + code);
                });
                if (!!isDocker()) return [3, 8];
                if (!(platform === 'android')) return [3, 6];
                return [4, Android.openProjectAsync(projectRoot)];
            case 5:
                _b = _d.sent(), success = _b.success, error = _b.error;
                if (!success) {
                    logger.error(error.message);
                }
                return [3, 8];
            case 6:
                if (!(platform === 'ios')) return [3, 8];
                return [4, Simulator.openUrlInSimulatorSafeAsync(localAddress)];
            case 7:
                _c = _d.sent(), success = _c.success, msg = _c.msg;
                if (!success) {
                    logger.error('Failed to start Simulator: ', msg);
                }
                _d.label = 8;
            case 8: return [3, 10];
            case 9:
                e_1 = _d.sent();
                logger.error(e_1.stack);
                return [3, 10];
            case 10: return [2];
        }
    });
}); };
var startWebpack = function (spin, builder, platforms) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (builder.stack.platform === 'server') {
            startServerWebpack(spin, builder);
        }
        else {
            startClientWebpack(!!platforms.server, spin, builder);
        }
        return [2];
    });
}); };
var allocateExpoPorts = function (expoPlatforms) { return __awaiter(_this, void 0, void 0, function () {
    var startPorts, _i, expoPlatforms_1, platform, expoPort;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                startPorts = { android: 19000, ios: 19500 };
                _i = 0, expoPlatforms_1 = expoPlatforms;
                _a.label = 1;
            case 1:
                if (!(_i < expoPlatforms_1.length)) return [3, 4];
                platform = expoPlatforms_1[_i];
                return [4, detectPort(startPorts[platform])];
            case 2:
                expoPort = _a.sent();
                expoPorts[platform] = expoPort;
                _a.label = 3;
            case 3:
                _i++;
                return [3, 1];
            case 4: return [2];
        }
    });
}); };
var startExpoProdServer = function (spin, mainBuilder, builders, logger) { return __awaiter(_this, void 0, void 0, function () {
    var connect, mime, compression, statusPageMiddleware, UrlUtils, packagerPort, app, serverInstance, projectRoot, localAddress;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                connect = mainBuilder.require('connect');
                mime = mainBuilder.require('mime', mainBuilder.require.resolve('webpack-dev-middleware'));
                compression = mainBuilder.require('compression');
                statusPageMiddleware = mainBuilder.require('react-native/local-cli/server/middleware/statusPageMiddleware.js');
                UrlUtils = mainBuilder.require('xdl').UrlUtils;
                logger.info("Starting Expo prod server");
                packagerPort = 3030;
                app = connect();
                app
                    .use(function (req, res, next) {
                    req.path = req.url.split('?')[0];
                    debug("Prod mobile packager request: " + req.url);
                    next();
                })
                    .use(statusPageMiddleware)
                    .use(compression())
                    .use(debugMiddleware)
                    .use(function (req, res, next) {
                    var platform = url.parse(req.url, true).query.platform;
                    if (platform) {
                        var platformFound = false;
                        for (var _i = 0, _a = Object.keys(builders); _i < _a.length; _i++) {
                            var name = _a[_i];
                            var builder = builders[name];
                            if (builder.stack.hasAny(platform)) {
                                platformFound = true;
                                var filePath = builder.buildDir
                                    ? path.join(builder.buildDir, req.path)
                                    : path.join(builder.frontendBuildDir || "build/client", platform, req.path);
                                if (fs.existsSync(filePath)) {
                                    res.writeHead(200, { 'Content-Type': mime.lookup ? mime.lookup(filePath) : mime.getType(filePath) });
                                    fs.createReadStream(filePath).pipe(res);
                                    return;
                                }
                            }
                        }
                        if (!platformFound) {
                            logger.error("Bundle for '" + platform + "' platform is missing! You need to build bundles both for Android and iOS.");
                        }
                        else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end("{\"message\": \"File not found for request: " + req.path + "\"}");
                        }
                    }
                    else {
                        next();
                    }
                });
                serverInstance = http.createServer(app);
                return [4, new Promise(function (resolve, reject) {
                        serverInstance.listen(packagerPort, function () {
                            logger.info("Production mobile packager listening on http://localhost:" + packagerPort);
                            resolve();
                        });
                    })];
            case 1:
                _a.sent();
                serverInstance.timeout = 0;
                serverInstance.keepAliveTimeout = 0;
                projectRoot = path.join(path.resolve('.'), '.expo', 'all');
                return [4, startExpoServer(spin, mainBuilder, projectRoot, packagerPort)];
            case 2:
                _a.sent();
                return [4, UrlUtils.constructManifestUrlAsync(projectRoot, {
                        hostType: 'localhost'
                    })];
            case 3:
                localAddress = _a.sent();
                logger.info("Expo server running on address: " + localAddress);
                return [2];
        }
    });
}); };
var startExp = function (spin, builders, logger) { return __awaiter(_this, void 0, void 0, function () {
    var mainBuilder, _i, _a, name, builder, projectRoot, expIdx, exp;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                for (_i = 0, _a = Object.keys(builders); _i < _a.length; _i++) {
                    name = _a[_i];
                    builder = builders[name];
                    if (builder.stack.hasAny(['ios', 'android'])) {
                        mainBuilder = builder;
                        break;
                    }
                }
                if (!mainBuilder) {
                    throw new Error('Builders for `ios` or `android` not found');
                }
                projectRoot = path.join(process.cwd(), '.expo', 'all');
                setupExpoDir(spin, mainBuilder, projectRoot, 'all');
                expIdx = process.argv.indexOf('exp');
                if (!(['ba', 'bi', 'build:android', 'build:ios', 'publish', 'p', 'server'].indexOf(process.argv[expIdx + 1]) >= 0)) return [3, 2];
                return [4, startExpoProdServer(spin, mainBuilder, builders, logger)];
            case 1:
                _b.sent();
                _b.label = 2;
            case 2:
                if (process.argv[expIdx + 1] !== 'server') {
                    exp = child_process_1.spawn(path.join(process.cwd(), 'node_modules/.bin/exp' + (__WINDOWS__ ? '.cmd' : '')), process.argv.splice(expIdx + 1), {
                        cwd: projectRoot,
                        stdio: [0, 1, 2]
                    });
                    exp.on('exit', function (code) {
                        process.exit(code);
                    });
                }
                return [2];
        }
    });
}); };
var runBuilder = function (cmd, builder, platforms) {
    process.chdir(builder.require.cwd);
    var spin = new Spin_1.default(builder.require.cwd, cmd);
    var prepareDllPromise = spin.watch && builder.webpackDll && builder.child ? buildDll(spin, builder) : Promise.resolve();
    prepareDllPromise.then(function () { return startWebpack(spin, builder, platforms); });
};
var execute = function (cmd, argv, builders, spin) {
    var expoPlatforms = [];
    var platforms = {};
    Object.keys(builders).forEach(function (name) {
        var builder = builders[name];
        var stack = builder.stack;
        platforms[stack.platform] = true;
        if (stack.hasAny('react-native') && stack.hasAny('ios')) {
            expoPlatforms.push('ios');
        }
        else if (stack.hasAny('react-native') && stack.hasAny('android')) {
            expoPlatforms.push('android');
        }
    });
    if (cluster.isMaster) {
        if (argv.verbose) {
            Object.keys(builders).forEach(function (name) {
                var builder = builders[name];
                spinLogger.log(name + " = ", require('util').inspect(builder.config, false, null));
            });
        }
        if (cmd === 'exp') {
            startExp(spin, builders, spinLogger);
        }
        else if (cmd === 'test') {
            var builder = void 0;
            for (var _i = 0, _a = Object.keys(builders); _i < _a.length; _i++) {
                var name = _a[_i];
                builder = builders[name];
                if (builder.roles.indexOf('test') >= 0) {
                    var testArgs = ['--webpack-config', builder.require.resolve('spinjs/webpack.config.js')];
                    if (builder.stack.hasAny('react')) {
                        var majorVer = builder.require('react/package.json').version.split('.')[0];
                        var reactVer = majorVer >= 16 ? majorVer : 15;
                        if (reactVer >= 16) {
                            testArgs.push('--include', 'raf/polyfill');
                        }
                    }
                    var testCmd = path.join(process.cwd(), 'node_modules/.bin/mocha-webpack' + (__WINDOWS__ ? '.cmd' : ''));
                    testArgs.push.apply(testArgs, process.argv.slice(process.argv.indexOf('test') + 1));
                    spinLogger.info("Running " + testCmd + " " + testArgs.join(' '));
                    var env = Object.create(process.env);
                    if (argv.c) {
                        env.SPIN_CWD = spin.cwd;
                        env.SPIN_CONFIG = path.resolve(argv.c);
                    }
                    var mochaWebpack = child_process_1.spawn(testCmd, testArgs, {
                        stdio: [0, 1, 2],
                        env: env,
                        cwd: builder.require.cwd
                    });
                    mochaWebpack.on('close', function (code) {
                        if (code !== 0) {
                            process.exit(code);
                        }
                    });
                }
            }
        }
        else {
            var prepareExpoPromise = spin.watch && expoPlatforms.length > 0 ? allocateExpoPorts(expoPlatforms) : Promise.resolve();
            prepareExpoPromise.then(function () {
                var workerBuilders = {};
                var potentialWorkerCount = 0;
                for (var _i = 0, _a = Object.keys(builders); _i < _a.length; _i++) {
                    var id = _a[_i];
                    var builder = builders[id];
                    if (builder.stack.hasAny(['dll', 'test'])) {
                        continue;
                    }
                    if (builder.cluster !== false) {
                        potentialWorkerCount++;
                    }
                }
                for (var _b = 0, _c = Object.keys(builders); _b < _c.length; _b++) {
                    var id = _c[_b];
                    var builder = builders[id];
                    if (builder.stack.hasAny(['dll', 'test'])) {
                        continue;
                    }
                    if (potentialWorkerCount > 1 && !builder.cluster) {
                        var worker = cluster.fork({ BUILDER_ID: id, EXPO_PORTS: JSON.stringify(expoPorts) });
                        workerBuilders[worker.process.pid] = builder;
                    }
                    else {
                        runBuilder(cmd, builder, platforms);
                    }
                }
                for (var _d = 0, _e = Object.keys(cluster.workers); _d < _e.length; _d++) {
                    var id = _e[_d];
                    cluster.workers[id].on('message', function (msg) {
                        debug("Master received message " + JSON.stringify(msg));
                        for (var _i = 0, _a = Object.keys(cluster.workers); _i < _a.length; _i++) {
                            var wid = _a[_i];
                            cluster.workers[wid].send(msg);
                        }
                    });
                }
                cluster.on('exit', function (worker, code, signal) {
                    if (cmd !== 'build') {
                        spinLogger.warn("Worker " + workerBuilders[worker.process.pid].id + " died, code: " + code + ", signal: " + signal);
                    }
                });
            });
        }
    }
    else {
        var builder_1 = builders[process.env.BUILDER_ID];
        var builderExpoPorts = JSON.parse(process.env.EXPO_PORTS);
        for (var _b = 0, _c = Object.keys(builderExpoPorts); _b < _c.length; _b++) {
            var platform = _c[_b];
            expoPorts[platform] = builderExpoPorts[platform];
        }
        process.on('message', function (msg) {
            if (msg.cmd === BACKEND_CHANGE_MSG) {
                debug("Increase backend reload count in " + builder_1.id);
                increaseBackendReloadCount();
            }
        });
        runBuilder(cmd, builder_1, platforms);
    }
};
exports.default = execute;
//# sourceMappingURL=executor.js.map