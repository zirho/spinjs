"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReactNativeWebPlugin = (function () {
    function ReactNativeWebPlugin() {
    }
    ReactNativeWebPlugin.prototype.configure = function (builder, spin) {
        var stack = builder.stack;
        if (stack.hasAll(['react-native-web', 'webpack']) && stack.hasAny(['server', 'web'])) {
            builder.config = spin.merge(builder.config, {
                resolve: {
                    alias: {
                        'react-native': 'react-native-web'
                    }
                }
            });
            if (stack.hasAny('server')) {
                var originalExternals_1 = builder.config.externals;
                builder.config.externals = function (context, request, callback) {
                    if (request.indexOf('react-native') >= 0) {
                        return callback(null, 'commonjs ' + request + '-web');
                    }
                    else {
                        return originalExternals_1(context, request, callback);
                    }
                };
            }
        }
    };
    return ReactNativeWebPlugin;
}());
exports.default = ReactNativeWebPlugin;
//# sourceMappingURL=ReactNativeWebPlugin.js.map