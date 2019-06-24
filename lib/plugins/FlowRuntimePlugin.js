"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSRuleFinder_1 = require("./shared/JSRuleFinder");
var FlowRuntimePLugin = (function () {
    function FlowRuntimePLugin() {
    }
    FlowRuntimePLugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['flow-runtime', 'webpack']) && !stack.hasAny('dll')) {
            var jsRuleFinder = new JSRuleFinder_1.default(builder);
            var jsRule = jsRuleFinder.findAndCreateJSRule();
            if (jsRule && !jsRule.use.options.babelrc) {
                jsRule.use = spin.merge(jsRule.use, {
                    options: {
                        plugins: [
                            [
                                'babel-plugin-flow-runtime',
                                {
                                    assert: true,
                                    annotate: true
                                }
                            ]
                        ]
                    }
                });
            }
        }
    };
    return FlowRuntimePLugin;
}());
exports.default = FlowRuntimePLugin;
//# sourceMappingURL=FlowRuntimePlugin.js.map