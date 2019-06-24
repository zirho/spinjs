"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fetch = require("node-fetch");
var path = require("path");
var source_map_1 = require("source-map");
function createSourceMapConsumer(compiler, url, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var response, sourceMap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, fetch(url)];
                case 1:
                    response = _a.sent();
                    return [4, response.text()];
                case 2:
                    sourceMap = _a.sent();
                    if (!sourceMap) {
                        logger.warn('Unable to find source map.');
                        return [2, null];
                    }
                    try {
                        return [2, new source_map_1.SourceMapConsumer(sourceMap)];
                    }
                    catch (err) {
                        logger.error('There was a problem reading the source map. :(');
                        return [2, null];
                    }
                    return [2];
            }
        });
    });
}
function getRequestedFrames(req) {
    if (typeof req.rawBody !== 'string') {
        return null;
    }
    var stack;
    try {
        var payload = JSON.parse(req.rawBody);
        stack = payload.stack;
    }
    catch (err) {
        stack = null;
    }
    if (!stack) {
        return null;
    }
    var newStack = stack.filter(function (stackLine) {
        var methodName = stackLine.methodName;
        var unwantedStackRegExp = new RegExp(/(__webpack_require__|haul|eval(JS){0,1})/);
        if (unwantedStackRegExp.test(methodName)) {
            return false;
        }
        var evalLine = methodName.indexOf('Object../');
        if (evalLine > -1) {
            var newMethodName = methodName.slice(evalLine + 9);
            stackLine.methodName = newMethodName;
        }
        return true;
    });
    return newStack;
}
function create(compiler, logger) {
    function symbolicateMiddleware(req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var unconvertedFrames, filenameMatch, platformMatch, filename, platform, _a, name, rest, bundleName, consumer, root, convertedFrames, responseObject, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (req.path !== '/symbolicate') {
                            return [2, next()];
                        }
                        unconvertedFrames = getRequestedFrames(req);
                        if (!unconvertedFrames || unconvertedFrames.length === 0) {
                            return [2, next()];
                        }
                        filenameMatch = unconvertedFrames[0].file.match(/\/(\D+)\?/);
                        platformMatch = unconvertedFrames[0].file.match(/platform=([a-zA-Z]*)/);
                        filename = filenameMatch && filenameMatch[1];
                        platform = platformMatch && platformMatch[1];
                        if (!filename || !platform) {
                            return [2, next()];
                        }
                        _a = filename.split('.'), name = _a[0], rest = _a.slice(1);
                        bundleName = name + ".mobile." + rest[rest.length - 1];
                        return [4, createSourceMapConsumer(compiler, "http://localhost:" + req.headers.host.split(':')[1] + "/" + bundleName + ".map", logger)];
                    case 1:
                        consumer = _b.sent();
                        if (!consumer) {
                            return [2, next()];
                        }
                        root = compiler.options.context;
                        convertedFrames = unconvertedFrames.map(function (originalFrame) {
                            var lookup = consumer.originalPositionFor({
                                line: originalFrame.lineNumber,
                                column: originalFrame.column
                            });
                            if (lookup.source == null) {
                                return originalFrame;
                            }
                            var mappedFile = lookup.source
                                .replace('webpack:///~', path.resolve(root, 'node_modules'))
                                .replace('webpack://', root);
                            return {
                                lineNumber: lookup.line,
                                column: lookup.column,
                                file: mappedFile,
                                methodName: originalFrame.methodName
                            };
                        });
                        responseObject = {
                            stack: convertedFrames
                        };
                        response = JSON.stringify(responseObject);
                        res.end(response);
                        return [2, null];
                }
            });
        });
    }
    return symbolicateMiddleware;
}
exports.default = create;
//# sourceMappingURL=symbolicateMiddleware.js.map