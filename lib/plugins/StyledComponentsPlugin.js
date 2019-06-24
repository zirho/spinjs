"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSRuleFinder_1 = require("./shared/JSRuleFinder");
var StyledComponentsPlugin = (function () {
    function StyledComponentsPlugin() {
    }
    StyledComponentsPlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['styled-components', 'webpack']) &&
            (stack.hasAny('web') || (stack.hasAny('server') && builder.ssr))) {
            var jsRuleFinder = new JSRuleFinder_1.default(builder);
            var jsRule = jsRuleFinder.findJSRule();
            if (jsRule && jsRule.use) {
                for (var idx = 0; idx < jsRule.use.length; idx++) {
                    var rule = jsRule.use[idx];
                    if (rule.loader.indexOf('babel') >= 0 && !rule.options.babelrc) {
                        jsRule.use[idx] = spin.merge(jsRule.use[idx], {
                            options: {
                                plugins: [['babel-plugin-styled-components', { ssr: builder.ssr }]]
                            }
                        });
                    }
                }
            }
        }
    };
    return StyledComponentsPlugin;
}());
exports.default = StyledComponentsPlugin;
//# sourceMappingURL=StyledComponentsPlugin.js.map