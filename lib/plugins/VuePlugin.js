"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VuePlugin = (function () {
    function VuePlugin() {
    }
    VuePlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['vue', 'webpack'])) {
            var webpack = builder.require('webpack');
            builder.config = spin.merge(builder.config, {
                module: {
                    rules: [
                        {
                            test: /\.vue$/,
                            use: { loader: 'vue-loader', options: spin.createConfig(builder, 'vue', {}) }
                        }
                    ]
                },
                resolve: {
                    alias: {
                        vue$: 'vue/dist/vue.esm.js'
                    }
                }
            });
        }
    };
    return VuePlugin;
}());
exports.default = VuePlugin;
//# sourceMappingURL=VuePlugin.js.map