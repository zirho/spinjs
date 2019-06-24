"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
exports.default = (function (rootPath, relPath) {
    if (relPath === void 0) { relPath = '.'; }
    var paths = [];
    var curDir = rootPath;
    while (true) {
        var lastIdx = curDir.lastIndexOf(path.sep, curDir.length - 1);
        paths.push(path.join(curDir + (lastIdx < 0 ? path.sep : ''), relPath));
        if (lastIdx < 0) {
            break;
        }
        curDir = curDir.substring(0, lastIdx);
    }
    return paths;
});
//# sourceMappingURL=upDirs.js.map