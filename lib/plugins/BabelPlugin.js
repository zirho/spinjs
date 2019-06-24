"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var JSRuleFinder_1 = require("./shared/JSRuleFinder");
var UPFinder_1 = require("./shared/UPFinder");
var BabelPlugin = (function () {
    function BabelPlugin() {
    }
    BabelPlugin.prototype.configure = function (builder, spin) {
        if (builder.stack.hasAny(['babel', 'es6']) &&
            builder.stack.hasAll(['webpack']) &&
            (!builder.stack.hasAny('dll') || builder.stack.hasAny(['android', 'ios']))) {
            if (builder.stack.hasAny(['babel', 'es6']) && !builder.stack.hasAny('dll')) {
                builder.config = spin.merge({
                    entry: {
                        index: ['babel-polyfill']
                    }
                }, builder.config);
            }
            var jsRuleFinder = new JSRuleFinder_1.default(builder);
            var jsRule = jsRuleFinder.findAndCreateJSRule();
            var cacheDirectory = builder.cache === false || (builder.cache === 'auto' && !spin.dev)
                ? false
                : path.join(builder.cache === true || (builder.cache === 'auto' && spin.dev) ? '.cache' : builder.cache, 'babel-loader');
            var babelrc = new UPFinder_1.default(builder).find(['.babelrc', '.babelrc.js', 'babel.config.js']);
            jsRule.use = {
                loader: builder.require.probe('heroku-babel-loader') ? 'heroku-babel-loader' : 'babel-loader',
                options: !!babelrc
                    ? { babelrc: true, cacheDirectory: cacheDirectory }
                    : spin.createConfig(builder, 'babel', {
                        babelrc: false,
                        cacheDirectory: cacheDirectory,
                        compact: !spin.dev,
                        presets: ['react', ['env', { modules: false }], 'stage-0'].concat(spin.dev ? [] : [['minify', { mangle: false }]]),
                        plugins: ['transform-runtime', 'transform-decorators-legacy', 'transform-class-properties'],
                        only: jsRuleFinder.extensions.map(function (ext) { return '*.' + ext; })
                    })
            };
        }
    };
    return BabelPlugin;
}());
exports.default = BabelPlugin;
//# sourceMappingURL=BabelPlugin.js.map