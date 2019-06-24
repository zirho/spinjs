"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var JSRuleFinder_1 = require("./shared/JSRuleFinder");
var ReactPlugin = (function () {
    function ReactPlugin() {
    }
    ReactPlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['react', 'webpack']) && !stack.hasAny('dll')) {
            var jsRuleFinder_1 = new JSRuleFinder_1.default(builder);
            var jsRule = jsRuleFinder_1.findJSRule();
            var tsRule = jsRuleFinder_1.findTSRule();
            if (jsRule) {
                jsRule.test = /^(?!.*[\\\/]node_modules[\\\/]).*\.jsx?$/;
                if (jsRule.use && jsRule.use.loader && jsRule.use.loader.indexOf('babel') >= 0 && !jsRule.use.options.babelrc) {
                    jsRule.use.options.only = jsRuleFinder_1.extensions.map(function (ext) { return '*.' + ext; });
                }
            }
            if (tsRule) {
                tsRule.test = /^(?!.*[\\\/]node_modules[\\\/]).*\.tsx?$/;
            }
            var majorVer = builder.require('react/package.json').version.split('.')[0];
            var reactVer = majorVer >= 16 ? majorVer : 15;
            builder.config.resolve.extensions = (stack.hasAny('web') || stack.hasAny('server') ? ['.web.', '.'] : ['.'])
                .map(function (prefix) { return jsRuleFinder_1.extensions.map(function (ext) { return prefix + ext; }); })
                .reduce(function (acc, val) { return acc.concat(val); })
                .concat(['.json']);
            if (stack.hasAny('web')) {
                for (var _i = 0, _a = Object.keys(builder.config.entry); _i < _a.length; _i++) {
                    var key = _a[_i];
                    var entry = builder.config.entry[key];
                    for (var idx = 0; idx < entry.length; idx++) {
                        var item = entry[idx];
                        if (['.tsx', '.jsx', '.ts', '.js'].indexOf(path.extname(item)) >= 0 && item.indexOf('node_modules') < 0) {
                            var baseItem = path.join(path.dirname(item), path.basename(item, path.extname(item)));
                            for (var _b = 0, _c = ['.js', '.jsx', '.ts', '.tsx']; _b < _c.length; _b++) {
                                var ext = _c[_b];
                                if (fs.existsSync(baseItem + ext)) {
                                    entry[idx] = (baseItem.startsWith('.') ? '' : './') + baseItem + ext;
                                }
                            }
                        }
                    }
                }
            }
            if (reactVer >= 16) {
                builder.config = spin.merge({
                    entry: {
                        index: ["raf/polyfill"]
                    }
                }, builder.config);
            }
        }
    };
    return ReactPlugin;
}());
exports.default = ReactPlugin;
//# sourceMappingURL=ReactPlugin.js.map