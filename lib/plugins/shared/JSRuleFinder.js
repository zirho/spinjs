"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSRuleFinder = (function () {
    function JSRuleFinder(builder) {
        this.builder = builder;
    }
    JSRuleFinder.prototype.findJSRule = function () {
        if (!this.jsRule) {
            var jsCandidates = ['\\.js$/', '\\.jsx?$/'];
            for (var _i = 0, _a = this.builder.config.module.rules; _i < _a.length; _i++) {
                var rule = _a[_i];
                for (var _b = 0, jsCandidates_1 = jsCandidates; _b < jsCandidates_1.length; _b++) {
                    var candidate = jsCandidates_1[_b];
                    if (String(rule.test).indexOf(candidate) >= 0) {
                        this.jsRule = rule;
                        break;
                    }
                }
            }
        }
        return this.jsRule;
    };
    JSRuleFinder.prototype.createJSRule = function () {
        if (this.jsRule) {
            throw new Error('js rule already exists!');
        }
        this.jsRule = { test: /^(?!.*[\\\/]node_modules[\\\/]).*\.js$/ };
        this.builder.config.module.rules = this.builder.config.module.rules.concat(this.jsRule);
        return this.jsRule;
    };
    JSRuleFinder.prototype.findAndCreateJSRule = function () {
        return this.findJSRule() || this.createJSRule();
    };
    JSRuleFinder.prototype.findTSRule = function () {
        if (!this.tsRule) {
            var jsCandidates = ['\\.ts$/', '\\.tsx?$/'];
            for (var _i = 0, _a = this.builder.config.module.rules; _i < _a.length; _i++) {
                var rule = _a[_i];
                for (var _b = 0, jsCandidates_2 = jsCandidates; _b < jsCandidates_2.length; _b++) {
                    var candidate = jsCandidates_2[_b];
                    if (String(rule.test).indexOf(candidate) >= 0) {
                        this.tsRule = rule;
                        break;
                    }
                }
            }
        }
        return this.tsRule;
    };
    JSRuleFinder.prototype.createTSRule = function () {
        if (this.tsRule) {
            throw new Error('ts rule already exists!');
        }
        this.tsRule = { test: /^(?!.*[\\\/]node_modules[\\\/]).*\.ts$/ };
        this.builder.config.module.rules = this.builder.config.module.rules.concat(this.tsRule);
        return this.tsRule;
    };
    JSRuleFinder.prototype.findAndCreateTSRule = function () {
        return this.findTSRule() || this.createTSRule();
    };
    Object.defineProperty(JSRuleFinder.prototype, "extensions", {
        get: function () {
            var result = [];
            this.findJSRule();
            this.findTSRule();
            var jsTestStr = String(this.jsRule ? this.jsRule.test : 'js');
            var tsTestStr = String(this.tsRule ? this.tsRule.test : '');
            if (tsTestStr.indexOf('tsx') >= 0) {
                result.push('tsx');
            }
            if (jsTestStr.indexOf('jsx') >= 0) {
                result.push('jsx');
            }
            if (tsTestStr.indexOf('ts') >= 0) {
                result.push('ts');
            }
            if (jsTestStr.indexOf('js') >= 0) {
                result.push('mjs');
                result.push('js');
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    return JSRuleFinder;
}());
exports.default = JSRuleFinder;
//# sourceMappingURL=JSRuleFinder.js.map