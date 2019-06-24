"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var path = require("path");
var util = require("util");
var createRequire_1 = require("../../createRequire");
module.exports = function assetLoader() {
    return __awaiter(this, void 0, void 0, function () {
        var callback, query, options, requireRelative, size, hasha, hashAssetFiles, AssetResolver, config, info, filepath, dirname, url, type, assets, suffix, filename, longname, result, map, scales, pairs, publicPath, hashes, asset, finalAsset, assetStr;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    this.cacheable();
                    callback = this.async();
                    query = this.query;
                    options = this.options ? this.options[query.config] || {} : {};
                    requireRelative = createRequire_1.default(query.cwd);
                    size = requireRelative('image-size');
                    hasha = requireRelative('hasha');
                    hashAssetFiles = requireRelative('expo/tools/hashAssetFiles');
                    AssetResolver = requireRelative('haul/src/resolvers/AssetResolver');
                    config = __assign({}, options, query);
                    try {
                        info = size(this.resourcePath);
                    }
                    catch (e) {
                    }
                    filepath = this.resourcePath;
                    dirname = path.dirname(filepath);
                    url = path
                        .relative(config.root, dirname)
                        .replace(/\\/g, '/')
                        .replace(/^[\.\/]*/, '');
                    type = path.extname(filepath).replace(/^\./, '');
                    assets = path.join('assets', config.bundle ? '' : config.platform);
                    suffix = "(@\\d+(\\.\\d+)?x)?(\\.(" + config.platform + "|native))?\\." + type + "$";
                    filename = path.basename(filepath).replace(new RegExp(suffix), '');
                    longname = (url.replace(/\//g, '_') + "_" + filename).toLowerCase().replace(/[^a-z0-9_]/g, '') + "." + type;
                    return [4, new Promise(function (resolve, reject) {
                            return _this.fs.readdir(dirname, function (err, res) {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(res);
                                }
                            });
                        })];
                case 1:
                    result = _a.sent();
                    map = AssetResolver.collect(result, {
                        name: filename,
                        type: type,
                        platform: config.platform
                    });
                    scales = Object.keys(map)
                        .map(function (s) { return Number(s.replace(/[^\d.]/g, '')); })
                        .sort();
                    return [4, Promise.all(Object.keys(map).map(function (scale) {
                            _this.addDependency(path.join(dirname, map[scale].name));
                            return new Promise(function (resolve, reject) {
                                return _this.fs.readFile(path.join(dirname, map[scale].name), function (err, res) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        var dest = void 0;
                                        if (config.bundle && config.platform === 'android') {
                                            switch (scale) {
                                                case '@0.75x':
                                                    dest = 'drawable-ldpi';
                                                    break;
                                                case '@1x':
                                                    dest = 'drawable-mdpi';
                                                    break;
                                                case '@1.5x':
                                                    dest = 'drawable-hdpi';
                                                    break;
                                                case '@2x':
                                                    dest = 'drawable-xhdpi';
                                                    break;
                                                case '@3x':
                                                    dest = 'drawable-xxhdpi';
                                                    break;
                                                case '@4x':
                                                    dest = 'drawable-xxxhdpi';
                                                    break;
                                                default:
                                                    throw new Error("Unknown scale " + scale + " for " + filepath);
                                            }
                                            dest = path.join(dest, longname);
                                        }
                                        else {
                                            var name = "" + filename + (scale === '@1x' ? '' : scale) + "." + type;
                                            dest = path.join(assets, url, name);
                                        }
                                        resolve({
                                            destination: dest,
                                            content: res
                                        });
                                    }
                                });
                            });
                        }))];
                case 2:
                    pairs = _a.sent();
                    pairs.forEach(function (item) {
                        var dest = item.destination.replace(/\\/g, '/');
                        if (config.outputPath) {
                            dest = typeof config.outputPath === 'function' ? config.outputPath(dest) : path.join(config.outputPath, dest);
                        }
                        _this.emitFile(dest, item.content);
                    });
                    publicPath = "__webpack_public_path__ + " + JSON.stringify((path.join(assets, '/') + url).replace(/[\\]+/g, '/'));
                    if (config.publicPath) {
                        publicPath = JSON.stringify(typeof config.publicPath === 'function' ? config.publicPath(url) : path.join(config.publicPath, url));
                    }
                    hashes = pairs.map(function (item) { return hasha(item.content, { algorithm: 'md5' }); });
                    asset = __assign({ __packager_asset: true, scales: scales, name: filename, type: type, hash: hashes.join() }, info);
                    asset.files = scales.map(function (scale) { return path.join(dirname, map["@" + scale + "x"].name); });
                    if (config.bundle) {
                        asset.fileSystemLocation = dirname;
                    }
                    return [4, hashAssetFiles(asset)];
                case 3:
                    finalAsset = _a.sent();
                    this._module._asset = finalAsset;
                    assetStr = '{\n ' + util.inspect(finalAsset).slice(1, -2) + (",\n  httpServerLocation: " + publicPath) + '}';
                    callback(null, "\n    var AssetRegistry = require('react-native/Libraries/Image/AssetRegistry');\n    module.exports = AssetRegistry.registerAsset(" + assetStr + ");\n    ");
                    return [2];
            }
        });
    });
};
module.exports.raw = true;
//# sourceMappingURL=assetLoader.js.map