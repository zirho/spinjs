"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSRuleFinder_1 = require("./shared/JSRuleFinder");
var ReactHotLoaderPlugin = (function () {
    function ReactHotLoaderPlugin() {
    }
    ReactHotLoaderPlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['react-hot-loader', 'webpack']) && spin.dev && !spin.test && !stack.hasAny('dll')) {
            builder.config = spin.mergeWithStrategy({
                entry: 'prepend'
            }, builder.config, {
                entry: {
                    index: ['react-hot-loader/patch']
                }
            });
            var jsRuleFinder = new JSRuleFinder_1.default(builder);
            var jsRule = jsRuleFinder.findAndCreateJSRule();
            var isBabelUsed = jsRule.use.loader && jsRule.use.loader.indexOf('babel') >= 0;
            jsRule.use = spin.merge(jsRule.use, {
                options: {
                    plugins: [isBabelUsed ? 'react-hot-loader/babel' : 'react-hot-loader/webpack']
                }
            });
        }
    };
    return ReactHotLoaderPlugin;
}());
exports.default = ReactHotLoaderPlugin;
//# sourceMappingURL=ReactHotLoaderPlugin.js.map