"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSRuleFinder_1 = require("../JSRuleFinder");
describe('JSRuleFinder', function () {
    it('should create js rule if it does not exist', function () {
        var builder = {};
        builder.config = {
            module: { rules: [] }
        };
        var rule = new JSRuleFinder_1.default(builder).findAndCreateJSRule();
        expect(rule).toHaveProperty('test');
    });
    it('should find js rule if it exists', function () {
        var builder = {};
        var regex = /\.js$/;
        builder.config = {
            module: { rules: [{ test: /abc/ }, { test: regex }, { test: /def/ }] }
        };
        var rule = new JSRuleFinder_1.default(builder).findAndCreateJSRule();
        expect(rule).toHaveProperty('test');
        expect(rule.test).toEqual(regex);
    });
});
//# sourceMappingURL=JSRuleFinder.test.js.map