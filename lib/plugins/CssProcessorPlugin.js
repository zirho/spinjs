"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var postCssDefaultConfig = function (builder) {
    return {
        plugins: function () { return [
            builder.require('autoprefixer')({
                browsers: ['last 2 versions', 'ie >= 9']
            })
        ]; }
    };
};
var CssProcessorPlugin = (function () {
    function CssProcessorPlugin() {
    }
    CssProcessorPlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        var dev = spin.dev;
        var loaderOptions = builder.sourceMap ? { sourceMap: true } : {};
        if (stack.hasAll('webpack') && !stack.hasAny('dll')) {
            var createRule = void 0;
            var rules = [];
            var postCssLoader_1 = builder.require.probe('postcss-loader') ? 'postcss-loader' : undefined;
            var useDefaultPostCss_1 = builder.useDefaultPostCss || false;
            var plugin_1;
            if (stack.hasAny('server')) {
                createRule = function (ext, nodeModules, ruleList) { return ({
                    test: nodeModules
                        ? new RegExp("^.*\\/node_modules\\/.*\\." + ext + "$")
                        : new RegExp("^(?!.*\\/node_modules\\/).*\\." + ext + "$"),
                    use: [
                        { loader: 'isomorphic-style-loader', options: spin.createConfig(builder, 'isomorphicStyle', {}) },
                        { loader: 'css-loader', options: spin.createConfig(builder, 'css', __assign({}, loaderOptions)) }
                    ]
                        .concat(postCssLoader_1 && !nodeModules
                        ? {
                            loader: postCssLoader_1,
                            options: spin.createConfig(builder, 'postCss', useDefaultPostCss_1 ? __assign({}, postCssDefaultConfig(builder), loaderOptions) : __assign({}, loaderOptions))
                        }
                        : [])
                        .concat(ruleList)
                }); };
            }
            else if (stack.hasAny('web')) {
                var webpackVer = builder.require('webpack/package.json').version.split('.')[0];
                if (webpackVer < 4) {
                    var ExtractCSSPlugin_1;
                    if (!dev) {
                        ExtractCSSPlugin_1 = builder.require('extract-text-webpack-plugin');
                    }
                    createRule = function (ext, nodeModules, ruleList) {
                        if (!dev && !plugin_1) {
                            plugin_1 = new ExtractCSSPlugin_1({ filename: "[name].[contenthash].css" });
                        }
                        return {
                            test: nodeModules
                                ? new RegExp("^.*\\/node_modules\\/.*\\." + ext + "$")
                                : new RegExp("^(?!.*\\/node_modules\\/).*\\." + ext + "$"),
                            use: dev
                                ? [
                                    { loader: 'style-loader', options: spin.createConfig(builder, 'style', {}) },
                                    {
                                        loader: 'css-loader',
                                        options: spin.createConfig(builder, 'css', __assign({}, loaderOptions, { importLoaders: 1 }))
                                    }
                                ]
                                    .concat(postCssLoader_1 && !nodeModules
                                    ? {
                                        loader: postCssLoader_1,
                                        options: spin.createConfig(builder, 'postCss', useDefaultPostCss_1
                                            ? __assign({}, postCssDefaultConfig(builder), loaderOptions) : __assign({}, loaderOptions))
                                    }
                                    : [])
                                    .concat(ruleList)
                                : plugin_1.extract({
                                    fallback: 'style-loader',
                                    use: [
                                        {
                                            loader: 'css-loader',
                                            options: spin.createConfig(builder, 'css', {
                                                importLoaders: postCssLoader_1 && !nodeModules ? 1 : 0
                                            })
                                        }
                                    ]
                                        .concat(postCssLoader_1 && !nodeModules
                                        ? {
                                            loader: postCssLoader_1,
                                            options: spin.createConfig(builder, 'postCss', useDefaultPostCss_1 ? postCssDefaultConfig(builder) : {})
                                        }
                                        : [])
                                        .concat(ruleList
                                        ? ruleList.map(function (rule) {
                                            var _a = rule.options, sourceMap = _a.sourceMap, options = __rest(_a, ["sourceMap"]);
                                            return { loader: rule.loader, options: options };
                                        })
                                        : [])
                                })
                        };
                    };
                }
                else {
                    var ExtractCSSPlugin_2;
                    if (!dev) {
                        ExtractCSSPlugin_2 = builder.require('mini-css-extract-plugin');
                    }
                    createRule = function (ext, nodeModules, ruleList) {
                        if (!dev && !plugin_1) {
                            plugin_1 = new ExtractCSSPlugin_2({
                                chunkFilename: '[id].css',
                                filename: "[name].[contenthash].css"
                            });
                        }
                        return {
                            test: nodeModules
                                ? new RegExp("^.*\\/node_modules\\/.*\\." + ext + "$")
                                : new RegExp("^(?!.*\\/node_modules\\/).*\\." + ext + "$"),
                            use: dev
                                ? [
                                    { loader: 'style-loader', options: spin.createConfig(builder, 'style', {}) },
                                    {
                                        loader: 'css-loader',
                                        options: spin.createConfig(builder, 'css', __assign({}, loaderOptions, { importLoaders: 1 }))
                                    }
                                ]
                                    .concat(postCssLoader_1 && !nodeModules
                                    ? {
                                        loader: postCssLoader_1,
                                        options: spin.createConfig(builder, 'postCss', useDefaultPostCss_1
                                            ? __assign({}, postCssDefaultConfig(builder), loaderOptions) : __assign({}, loaderOptions))
                                    }
                                    : [])
                                    .concat(ruleList)
                                : [
                                    { loader: ExtractCSSPlugin_2.loader, options: spin.createConfig(builder, 'mini-css-extract', {}) },
                                    {
                                        loader: 'css-loader',
                                        options: spin.createConfig(builder, 'css', {
                                            importLoaders: postCssLoader_1 && !nodeModules ? 1 : 0
                                        })
                                    }
                                ]
                                    .concat(postCssLoader_1 && !nodeModules
                                    ? {
                                        loader: postCssLoader_1,
                                        options: spin.createConfig(builder, 'postCss', useDefaultPostCss_1 ? postCssDefaultConfig(builder) : {})
                                    }
                                    : [])
                                    .concat(ruleList
                                    ? ruleList.map(function (rule) {
                                        var _a = rule.options, sourceMap = _a.sourceMap, options = __rest(_a, ["sourceMap"]);
                                        return { loader: rule.loader, options: options };
                                    })
                                    : [])
                        };
                    };
                }
            }
            if (createRule && stack.hasAny('css')) {
                rules.push(createRule('css', false, []), createRule('css', true, []));
            }
            if (createRule && stack.hasAny('sass')) {
                var sassRule = [{ loader: 'sass-loader', options: spin.createConfig(builder, 'sass', __assign({}, loaderOptions)) }];
                rules.push(createRule('scss', false, sassRule), createRule('scss', true, sassRule));
            }
            if (createRule && stack.hasAny('less')) {
                var lessLoaderVer = builder.require('less-loader/package.json').version.split('.')[0];
                var options = lessLoaderVer >= 4 ? __assign({ javascriptEnabled: true }, loaderOptions) : __assign({}, loaderOptions);
                var lessRule = [{ loader: 'less-loader', options: spin.createConfig(builder, 'less', options) }];
                rules.push(createRule('less', false, lessRule), createRule('less', true, lessRule));
            }
            builder.config = spin.merge(builder.config, {
                module: {
                    rules: rules
                }
            });
            if (plugin_1) {
                builder.config.plugins.push(plugin_1);
            }
        }
    };
    return CssProcessorPlugin;
}());
exports.default = CssProcessorPlugin;
//# sourceMappingURL=CssProcessorPlugin.js.map