"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createConfig_1 = require("./createConfig");
var builders = createConfig_1.default(process.env.SPIN_CWD || process.cwd(), 'test', { c: process.env.SPIN_CONFIG }).builders;
var testConfig = builders[Object.keys(builders)[0]].config;
exports.default = testConfig;
//# sourceMappingURL=webpack.config.js.map