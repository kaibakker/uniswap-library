"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var Delta = /** @class */ (function () {
    function Delta(eth, tokens, liquidity) {
        if (eth === void 0) { eth = 0; }
        if (tokens === void 0) { tokens = 0; }
        if (liquidity === void 0) { liquidity = 0; }
        this.eth = new bignumber_js_1.default(eth);
        this.tokens = new bignumber_js_1.default(tokens);
        this.liquidity = new bignumber_js_1.default(liquidity);
    }
    Delta.prototype.plus = function (delta) {
        return new Delta(this.eth.plus(delta.eth), this.tokens.plus(delta.tokens), this.liquidity.plus(delta.liquidity));
    };
    Delta.prototype.isEqual = function (delta) {
        return this.eth === delta.eth && this.tokens === delta.tokens && this.liquidity === delta.liquidity;
    };
    Delta.prototype.toString = function () {
        return "Delta(" + this.eth.toString() + ", " + this.tokens.toString() + ", " + this.liquidity.toString() + ")";
    };
    return Delta;
}());
exports.Delta = Delta;
