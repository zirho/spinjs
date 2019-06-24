"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var I18NextPlugin = (function () {
    function I18NextPlugin() {
    }
    I18NextPlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['i18next', 'webpack'])) {
            var webpack = builder.require('webpack');
            builder.config = spin.merge(builder.config, {
                module: {
                    rules: [
                        {
                            test: /locales/,
                            use: { loader: '@alienfast/i18next-loader', options: spin.createConfig(builder, 'i18next', {}) }
                        }
                    ]
                }
            });
        }
    };
    return I18NextPlugin;
}());
exports.default = I18NextPlugin;
//# sourceMappingURL=I18NextPlugin.js.map