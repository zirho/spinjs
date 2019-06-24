"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Stack = (function () {
    function Stack() {
        var stack = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            stack[_i] = arguments[_i];
        }
        this.technologies = stack
            .reduce(function (acc, tech) {
            if (!tech) {
                return acc;
            }
            else if (tech.constructor === Array) {
                return acc.concat(tech);
            }
            else {
                return acc.concat(tech.split(':'));
            }
        }, [])
            .filter(function (v, i, a) { return a.indexOf(v) === i; });
        if (this.hasAny('server')) {
            this.platform = 'server';
        }
        else if (this.hasAny('web')) {
            this.platform = 'web';
        }
        else if (this.hasAny('android')) {
            this.platform = 'android';
        }
        else if (this.hasAny('ios')) {
            this.platform = 'ios';
        }
        else {
            throw new Error("stack should include one of 'server', 'web', 'android', 'ios', stack: " + this.technologies);
        }
    }
    Stack.prototype.hasAny = function (technologies) {
        var array = technologies.constructor === Array ? technologies : [technologies];
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var feature = array_1[_i];
            if (this.technologies.indexOf(feature) >= 0) {
                return true;
            }
        }
        return false;
    };
    Stack.prototype.hasAll = function (technologies) {
        var array = technologies.constructor === Array ? technologies : [technologies];
        for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
            var feature = array_2[_i];
            if (this.technologies.indexOf(feature) < 0) {
                return false;
            }
        }
        return true;
    };
    return Stack;
}());
exports.default = Stack;
//# sourceMappingURL=Stack.js.map