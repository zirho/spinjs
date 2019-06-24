"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var upDirs_1 = require("../../upDirs");
var default_1 = (function () {
    function default_1(builder) {
        this.cwd = builder.require.cwd;
    }
    default_1.prototype.find = function (candidates) {
        var foundPath;
        var paths = upDirs_1.default(this.cwd);
        for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
            var dir = paths_1[_i];
            for (var _a = 0, candidates_1 = candidates; _a < candidates_1.length; _a++) {
                var candidate = candidates_1[_a];
                var candidatePath = path.join(dir, candidate);
                if (fs.existsSync(candidatePath)) {
                    foundPath = candidatePath;
                    break;
                }
            }
            if (foundPath) {
                break;
            }
        }
        return foundPath;
    };
    return default_1;
}());
exports.default = default_1;
//# sourceMappingURL=UPFinder.js.map