"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EnhancedError = (function (_super) {
    __extends(EnhancedError, _super);
    function EnhancedError(message, cause) {
        var _this = _super.call(this, message) || this;
        _this.cause = cause;
        return _this;
    }
    return EnhancedError;
}(Error));
exports.default = EnhancedError;
//# sourceMappingURL=EnhancedError.js.map