"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var JSRuleFinder_1 = require("./shared/JSRuleFinder");
var persistPlugins;
var ApolloPlugin = (function () {
    function ApolloPlugin() {
    }
    ApolloPlugin.prototype.configure = function (builder, spin) {
        var _a, _b;
        if (!builder.stack.hasAny('dll') && builder.stack.hasAll(['apollo', 'webpack'])) {
            var persistGraphQL = builder.persistGraphQL && !spin.test && !!builder.require.probe('persistgraphql-webpack-plugin');
            if (builder.stack.hasAny(['server', 'web'])) {
                if (!persistPlugins) {
                    var moduleName = path.resolve('node_modules/persisted_queries.json');
                    if (persistGraphQL) {
                        var PersistGraphQLPlugin = builder.require('persistgraphql-webpack-plugin');
                        var clientPersistPlugin = new PersistGraphQLPlugin({
                            moduleName: moduleName,
                            filename: 'extracted_queries.json',
                            addTypename: true
                        });
                        var serverPersistPlugin = new PersistGraphQLPlugin({
                            moduleName: moduleName,
                            provider: clientPersistPlugin
                        });
                        persistPlugins = { client: clientPersistPlugin, server: serverPersistPlugin };
                    }
                    else {
                        var VirtualModules = builder.require('webpack-virtual-modules');
                        var clientPersistPlugin = new VirtualModules((_a = {}, _a[moduleName] = '{}', _a));
                        var serverPersistPlugin = new VirtualModules((_b = {}, _b[moduleName] = '{}', _b));
                        persistPlugins = { client: clientPersistPlugin, server: serverPersistPlugin };
                    }
                }
            }
            builder.config = spin.merge(builder.config, {
                module: {
                    rules: [
                        {
                            test: /\.graphqls/,
                            use: { loader: 'raw-loader', options: spin.createConfig(builder, 'raw', {}) }
                        },
                        {
                            test: /\.(graphql|gql)$/,
                            exclude: /node_modules/,
                            use: [{ loader: 'graphql-tag/loader', options: spin.createConfig(builder, 'graphqlTag', {}) }].concat(persistGraphQL ? ['persistgraphql-webpack-plugin/graphql-loader'] : [])
                        }
                    ]
                }
            });
            if (builder.stack.hasAny(['server', 'web'])) {
                var webpack = builder.require('webpack');
                if (persistGraphQL) {
                    var jsRuleFinder = new JSRuleFinder_1.default(builder);
                    var jsRule = jsRuleFinder.findAndCreateJSRule();
                    jsRule.use = spin.merge(jsRule.use, ['persistgraphql-webpack-plugin/js-loader']);
                }
                builder.config = spin.merge(builder.config, {
                    plugins: [
                        new webpack.DefinePlugin({ __PERSIST_GQL__: persistGraphQL }),
                        builder.stack.hasAny('server') ? persistPlugins.server : persistPlugins.client
                    ]
                });
            }
        }
    };
    return ApolloPlugin;
}());
exports.default = ApolloPlugin;
//# sourceMappingURL=ApolloPlugin.js.map