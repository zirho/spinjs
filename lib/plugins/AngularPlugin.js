"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var JSRuleFinder_1 = require("./shared/JSRuleFinder");
var AngularPlugin = (function () {
    function AngularPlugin() {
    }
    AngularPlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['angular', 'webpack'])) {
            var webpack = builder.require('webpack');
            var jsRuleFinder = new JSRuleFinder_1.default(builder);
            var tsRule = jsRuleFinder.findAndCreateTSRule();
            builder.config = spin.merge(builder.config, {
                module: {
                    rules: [
                        {
                            test: tsRule.test,
                            use: { loader: 'angular2-template-loader', options: spin.createConfig(builder, 'angular2Template', {}) }
                        }
                    ]
                },
                plugins: [
                    new webpack.ContextReplacementPlugin(/angular[\\\/]core[\\\/]@angular/, path.join(builder.require.cwd, 'src'), {})
                ]
            });
            if (!stack.hasAny('dll') && stack.hasAny('web')) {
                builder.config = spin.merge({
                    entry: {
                        index: [require.resolve('./angular/angular-polyfill.js')]
                    }
                }, builder.config);
                var CheckerPlugin = builder.require('awesome-typescript-loader').CheckerPlugin;
                builder.config = spin.merge(builder.config, {
                    module: {
                        rules: [
                            {
                                test: /\.html$/,
                                loader: 'html-loader',
                                options: spin.createConfig(builder, 'html', {})
                            }
                        ]
                    },
                    plugins: [new CheckerPlugin()]
                });
            }
        }
    };
    return AngularPlugin;
}());
exports.default = AngularPlugin;
//# sourceMappingURL=AngularPlugin.js.map