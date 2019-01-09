"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var Trade = /** @class */ (function () {
    function Trade(eth, tokens, liquidity) {
        if (eth === void 0) { eth = 0; }
        if (tokens === void 0) { tokens = 0; }
        if (liquidity === void 0) { liquidity = 0; }
        this.delta.eth = new bignumber_js_1.default(eth);
        this.delta.tokens = new bignumber_js_1.default(tokens);
        this.delta.liquidity = new bignumber_js_1.default(liquidity);
    }
    Trade.prototype.plus = function (eth, tokens, liquidity) {
        return new Trade(this.delta.eth.plus(eth), this.delta.tokens.plus(tokens), this.delta.liquidity.plus(liquidity));
    };
    Trade.prototype.isEqual = function (trade) {
        return this.delta.eth === trade.delta.eth && this.delta.tokens === trade.delta.tokens && this.delta.liquidity === trade.delta.liquidity;
    };
    Trade.prototype.toString = function () {
        // return `${this.delta.events()[0][0]}(${this.delta.eth.toString()}, ${this.delta.tokens.toString()}, ${this.delta.liquidity.toString()})`;
        return "";
    };
    Trade.prototype.asVector = function () {
        return [this.delta.eth.dividedBy(Math.pow(10, 18)).toNumber(), this.delta.tokens.dividedBy(Math.pow(10, 18)).toNumber(), this.delta.liquidity.dividedBy(Math.pow(10, 18)).toNumber()];
    };
    Trade.prototype.events = function () {
        if (this.delta.liquidity.eq(0)) {
            if (this.delta.eth.gt(0)) {
                return ['EthPurchase'];
            }
            else if (this.delta.eth.lt(0)) {
                return ['TokenPurchase'];
            }
        }
        else if (this.delta.liquidity.gt(0)) {
            return ['AddLiquidity', 'Transfer'];
        }
        else if (this.delta.liquidity.lt(0)) {
            return ['RemoveLiquidity', 'Transfer'];
        }
    };
    return Trade;
}());
exports.Trade = Trade;
