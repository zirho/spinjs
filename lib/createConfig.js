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
var cluster = require("cluster");
var fs = require("fs");
var minilog = require("minilog");
var BuilderDiscoverer_1 = require("./BuilderDiscoverer");
var AngularPlugin_1 = require("./plugins/AngularPlugin");
var ApolloPlugin_1 = require("./plugins/ApolloPlugin");
var BabelPlugin_1 = require("./plugins/BabelPlugin");
var CssProcessorPlugin_1 = require("./plugins/CssProcessorPlugin");
var FlowRuntimePlugin_1 = require("./plugins/FlowRuntimePlugin");
var I18NextPlugin_1 = require("./plugins/I18NextPlugin");
var ReactHotLoaderPlugin_1 = require("./plugins/ReactHotLoaderPlugin");
var ReactNativePlugin_1 = require("./plugins/ReactNativePlugin");
var ReactNativeWebPlugin_1 = require("./plugins/ReactNativeWebPlugin");
var ReactPlugin_1 = require("./plugins/ReactPlugin");
var StyledComponentsPlugin_1 = require("./plugins/StyledComponentsPlugin");
var TCombPlugin_1 = require("./plugins/TCombPlugin");
var TypeScriptPlugin_1 = require("./plugins/TypeScriptPlugin");
var VuePlugin_1 = require("./plugins/VuePlugin");
var WebAssetsPlugin_1 = require("./plugins/WebAssetsPlugin");
var WebpackPlugin_1 = require("./plugins/WebpackPlugin");
var Spin_1 = require("./Spin");
var Stack_1 = require("./Stack");
var WEBPACK_OVERRIDES_NAME = 'webpack.overrides.js';
var spinLogger = minilog('spin');
var createConfig = function (cwd, cmd, argv, builderName) {
    var builders = {};
    var plugins = [
        new WebpackPlugin_1.default(),
        new WebAssetsPlugin_1.default(),
        new CssProcessorPlugin_1.default(),
        new ApolloPlugin_1.default(),
        new TypeScriptPlugin_1.default(),
        new BabelPlugin_1.default(),
        new ReactPlugin_1.default(),
        new ReactHotLoaderPlugin_1.default(),
        new TCombPlugin_1.default(),
        new FlowRuntimePlugin_1.default(),
        new ReactNativePlugin_1.default(),
        new ReactNativeWebPlugin_1.default(),
        new StyledComponentsPlugin_1.default(),
        new AngularPlugin_1.default(),
        new VuePlugin_1.default(),
        new I18NextPlugin_1.default()
    ];
    var spin = new Spin_1.default(cwd, cmd);
    var builderDiscoverer = new BuilderDiscoverer_1.default(spin, plugins, argv);
    var role = cmd;
    if (cmd === 'exp') {
        role = 'build';
    }
    else if (cmd === 'start') {
        role = 'watch';
    }
    var discoveredBuilders = builderDiscoverer.discover();
    if (!discoveredBuilders) {
        throw new Error('Cannot find spinjs config');
    }
    if (cluster.isMaster && argv.verbose) {
        spinLogger.log('SpinJS Config:\n', require('util').inspect(discoveredBuilders, false, null));
    }
    for (var _i = 0, _a = Object.keys(discoveredBuilders); _i < _a.length; _i++) {
        var builderId = _a[_i];
        var builder = discoveredBuilders[builderId];
        var stack = builder.stack;
        if (builder.name !== builderName && (builder.enabled === false || builder.roles.indexOf(role) < 0)) {
            continue;
        }
        if (spin.dev && builder.webpackDll && !stack.hasAny('server') && !builderName) {
            var dllBuilder = __assign({}, builder);
            dllBuilder.name = builder.name + 'Dll';
            dllBuilder.require = builder.require;
            dllBuilder.parent = builder;
            dllBuilder.stack = new Stack_1.default(dllBuilder.stack.technologies, 'dll');
            builders[builderId.split('[')[0] + "[" + builder.name + "Dll]"] = dllBuilder;
            builder.child = dllBuilder;
        }
        builders[builderId] = builder;
    }
    var _loop_1 = function (builderId) {
        var builder = builders[builderId];
        var overridesConfig = builder.overridesConfig || WEBPACK_OVERRIDES_NAME;
        var overrides = fs.existsSync(overridesConfig) ? builder.require('./' + overridesConfig) : {};
        builder.depPlatforms = overrides.dependencyPlatforms || builder.depPlatforms || {};
        builder.dllExcludes = builder.dllExcludes || [];
        builder.plugins.forEach(function (plugin) { return plugin.configure(builder, spin); });
        var strategy = {
            entry: 'replace',
            stats: 'replace'
        };
        if (overrides[builder.name]) {
            builder.config = spin.mergeWithStrategy(strategy, builder.config, overrides[builder.name]);
        }
        builder.config = spin.createConfig(builder, 'webpack', builder.config);
    };
    for (var _b = 0, _c = Object.keys(builders); _b < _c.length; _b++) {
        var builderId = _c[_b];
        _loop_1(builderId);
    }
    return { builders: builders, spin: spin };
};
exports.default = createConfig;
//# sourceMappingURL=createConfig.js.map