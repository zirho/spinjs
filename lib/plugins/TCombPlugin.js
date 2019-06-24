"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSRuleFinder_1 = require("./shared/JSRuleFinder");
var TCombPlugin = (function () {
    function TCombPlugin() {
    }
    TCombPlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['tcomb', 'webpack']) && !stack.hasAny('dll')) {
            var jsRuleFinder = new JSRuleFinder_1.default(builder);
            var jsRule = jsRuleFinder.findJSRule();
            if (jsRule && !jsRule.use.options.babelrc) {
                jsRule.use = spin.merge(jsRule.use, {
                    options: {
                        plugins: [['babel-plugin-tcomb']]
                    }
                });
            }
        }
    };
    return TCombPlugin;
}());
exports.default = TCombPlugin;
//# sourceMappingURL=TCombPlugin.js.map