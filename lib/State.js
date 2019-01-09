"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var Trade_1 = require("./Trade");
// import { Delta } from './Delta'
// eth: BN;
// tokens: BN;
// liquidity: BN;
// constructor(eth?: any, tokens?: any, liquidity?: any);
// neutralPrice(): BN;
// reserve(): BN;
// valid(): boolean;
// toString(): string;
// trade(eth: BN, tokens: BN, liquidity: BN): Trade;
// addEvent(event: any): Trade;
// addLiquidity(eth?: BN, min_liquidity?: BN, max_tokens?: BN): Trade;
// removeLiquidity(amount?: BN, min_eth?: BN, min_tokens?: BN): Trade;
// ethToTokenInput(eth_sold?: BN, min_tokens?: BN): Trade;
// ethToTokenOutput(tokens_bought?: BN, max_eth?: BN): Trade;
// tokenToEthInput(token_sold?: BN, min_eth?: BN): Trade;
// tokenToEthOutput(eth_bought?: BN, max_tokens?: BN): Trade;
// tradeToPrice(price: any, max_liquidity: any): Trade;
console.log("new BN(undefined)");
var State = /** @class */ (function () {
    function State(eth, tokens, liquidity) {
        if (eth === void 0) { eth = 0; }
        if (tokens === void 0) { tokens = 0; }
        if (liquidity === void 0) { liquidity = 0; }
        this.eth = new bignumber_js_1.default(eth);
        this.tokens = new bignumber_js_1.default(tokens);
        this.liquidity = new bignumber_js_1.default(liquidity);
    }
    State.prototype.neutralPrice = function () {
        return this.tokens.div(this.eth);
    };
    State.prototype.reserve = function () {
        return this.tokens.mul(this.eth);
    };
    State.prototype.valid = function () {
        if (!this.eth.gte(0))
            throw new Error("NEGATIVE_ETH_RESERVE");
        if (!this.tokens.gte(0))
            throw new Error("NEGATIVE_TOKEN_RESERVE");
        if (!this.liquidity.gte(0))
            throw new Error("NEGATIVE_TOTAL_SUPPLY");
    };
    State.prototype.toString = function () {
        return "this.toString()";
    };
    State.prototype.trade = function (eth, tokens, liquidity) {
        if (liquidity === void 0) { liquidity = new bignumber_js_1.default(0); }
        return new Trade_1.Trade(this.eth.plus(new bignumber_js_1.default(eth)), this.tokens.plus(new bignumber_js_1.default(tokens)), this.liquidity.plus(new bignumber_js_1.default(liquidity)));
    };
    State.prototype.tradeToPrice = function (price, max_liquidity) {
        if (max_liquidity === void 0) { max_liquidity = undefined; }
        var eth = this.reserve().div(new bignumber_js_1.default(price)).sqrt().minus(this.eth);
        if (eth.gt(0)) {
            if (max_liquidity) {
                eth = bignumber_js_1.default.min(eth, max_liquidity);
            }
            return this.ethToTokenInput(eth);
        }
        else {
            if (max_liquidity) {
                eth = bignumber_js_1.default.min(eth.neg(), max_liquidity);
            }
            else {
                eth = eth.neg();
            }
            return this.tokenToEthOutput(eth);
        }
    };
    State.prototype.addEvent = function (event) {
        var eth = new bignumber_js_1.default(0), tokens = new bignumber_js_1.default(0), liquidity = new bignumber_js_1.default(0);
        if (event.event === 'RemoveLiquidity') {
            // this.removeLiquidity(new BN(event.returnValues.eth_amount));
            eth = new bignumber_js_1.default(event.returnValues.eth_amount).neg();
            tokens = new bignumber_js_1.default(event.returnValues.token_amount).neg();
        }
        else if (event.event === 'AddLiquidity') {
            // this.addLiquidity(new BN(event.returnValues.eth_amount));
            eth = new bignumber_js_1.default(event.returnValues.eth_amount);
            tokens = new bignumber_js_1.default(event.returnValues.token_amount);
        }
        else if (event.event === 'EthPurchase') {
            // this.tokenToEthInput(new BN(event.eth_bought), new BN(event.tokens_sold))
            eth = new bignumber_js_1.default(event.returnValues.eth_bought);
            tokens = new bignumber_js_1.default(event.returnValues.tokens_sold).neg();
        }
        else if (event.event === 'TokenPurchase') {
            // this.ethToTokenInput(new BN(event.eth_sold), new BN(event.tokens_bought))
            eth = new bignumber_js_1.default(event.returnValues.eth_sold).neg();
            tokens = new bignumber_js_1.default(event.returnValues.tokens_bought);
        }
        else if (event.event === 'Transfer') {
            if (event.returnValues._from === '0x0000000000000000000000000000000000000000') {
                // thiss.push(this.addLiquidity(new BN(event.returnValues._value)));
                liquidity = new bignumber_js_1.default(event.returnValues._value);
            }
            else if (event.returnValues._to === '0x0000000000000000000000000000000000000000') {
                // thiss.push(this.removeLiquidity(new BN(event.returnValues._value)));
                liquidity = new bignumber_js_1.default(event.returnValues._value).neg();
            }
        }
        return this.trade(eth, tokens, liquidity);
    };
    // # @notice Deposit ETH and Tokens (self.token) at current ratio to mint UNI tokens.
    // # @dev min_amount has a djfferent meaning when total UNI supply is 0.
    // # @param min_liquidity Minimum number of UNI sender will mint if total UNI supply is greater than 0.
    // # @param min_amount Maximum number of tokens deposited. Deposits max amount if total UNI supply is 0.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @return The amount of UNI minted.
    // @public
    // @payable
    // def addLiquidity(min_liquidity: uint256, max_tokens: uint256, deadline: timestamp) -> uint256:
    State.prototype.addLiquidity = function (eth, min_liquidity, max_tokens) {
        if (min_liquidity === void 0) { min_liquidity = undefined; }
        if (max_tokens === void 0) { max_tokens = undefined; }
        var _eth = new bignumber_js_1.default(eth);
        if (!(eth.greaterThan(0)))
            throw new Error("Error Eth");
        // not empty
        if (this.active()) {
            var tokens = _eth.mul(this.tokens).div(this.eth).plus(1);
            var liquidity = _eth.mul(this.liquidity).div(this.eth);
            if (max_tokens && tokens.lt(max_tokens) && max_tokens.gt(0))
                throw new Error("Error Tokens");
            if (min_liquidity && liquidity.lt(min_liquidity) && min_liquidity.gt(0))
                throw new Error("Error liquidity");
            return this.trade(_eth, tokens, liquidity);
        }
        else {
            return this.trade(_eth, new bignumber_js_1.default(max_tokens), new bignumber_js_1.default(min_liquidity));
        }
    };
    State.prototype.active = function () {
        return this.liquidity.greaterThan(0);
    };
    // # @dev Burn UNI tokens to withdraw ETH and Tokens at current ratio.
    // # @param amount Amount of UNI burned.
    // # @param min_eth Minimum ETH withdrawn.
    // # @param min_tokens Minimum Tokens withdrawn.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @return The amount of ETH and Tokens withdrawn.
    // @public
    // def removeLiquidity(amount: uint256, min_eth: uint256(wei), min_tokens: uint256, deadline: timestamp) -> (uint256(wei), uint256):
    State.prototype.removeLiquidity = function (liquidity, min_eth, min_tokens) {
        if (min_eth === void 0) { min_eth = undefined; }
        if (min_tokens === void 0) { min_tokens = undefined; }
        if (!(liquidity.greaterThan(0) && min_eth.greaterThan(0) && min_tokens.greaterThan(0)))
            return;
        if (!(this.liquidity.greaterThan(0)))
            return;
        var eth = liquidity.mul(this.eth).div(this.liquidity);
        var tokens = liquidity.mul(this.tokens).div(this.liquidity);
        if (!(eth.gte(min_eth) && tokens.gte(min_tokens)))
            return;
        return this.trade(eth.neg(), tokens.neg(), liquidity.neg());
    };
    // # @dev Pricing functon for converting between ETH and Tokens.
    // # @param input_amount Amount of ETH or Tokens being sold.
    // # @param input_reserve Amount of ETH or Tokens (input type) in exchange reserves.
    // # @param output_reserve Amount of ETH or Tokens (output type) in exchange reserves.
    // # @return Amount of ETH or Tokens bought.
    // @private
    // @constant
    // def getInputPrice(input_amount: uint256, input_reserve: uint256, output_reserve: uint256) -> uint256:
    State.prototype.getInputPrice = function (input_amount, input_reserve, output_reserve) {
        if (!(input_reserve.greaterThan(0) && this.tokens.greaterThan(0)))
            return;
        var input_amount_with_fee = input_amount.mul(997);
        var numerator = input_amount_with_fee.mul(this.tokens);
        var denominator = input_reserve.mul(1000).plus(input_amount_with_fee);
        return this.trade(numerator.div(denominator), input_amount.neg(), new bignumber_js_1.default(0));
    };
    // # @dev Pricing functon for converting between ETH and Tokens.
    // # @param output_amount Amount of ETH or Tokens being bought.
    // # @param input_reserve Amount of ETH or Tokens (input type) in exchange reserves.
    // # @param output_reserve Amount of ETH or Tokens (output type) in exchange reserves.
    // # @return Amount of ETH or Tokens sold.
    // @private
    // @constant
    // def getOutputPrice(output_amount: uint256, input_reserve: uint256, output_reserve: uint256) -> uint256:
    State.prototype.getOutputPrice = function (output_amount, input_reserve, output_reserve) {
        if (!(this.tokens.greaterThan(0) && this.eth.greaterThan(0)))
            return;
        var numerator = this.tokens.mul(output_amount).mul(1000);
        var denominator = (this.eth.minus(output_amount)).mul(997);
        return this.trade(numerator.div(denominator).plus(1).neg(), output_amount, new bignumber_js_1.default(0));
    };
    // @private
    // def ethToTokenInput(eth_sold: uint256(wei), min_tokens: uint256, deadline: timestamp, buyer: address, recipient: address) -> uint256:
    State.prototype.ethToTokenInput = function (eth_sold, min_tokens) {
        if (min_tokens === void 0) { min_tokens = new bignumber_js_1.default(1); }
        var eth = new bignumber_js_1.default(eth_sold);
        if (!(eth.greaterThan(0)))
            throw new Error("ETH_SOLD NEGATIVE");
        if (!(min_tokens.greaterThan(0)))
            throw new Error("MIN_TOKENS NEGATIVE");
        return this.getInputPrice(eth, this.eth, this.tokens);
    };
    State.prototype.tokenToEthInput = function (tokens_sold, min_eth) {
        if (min_eth === void 0) { min_eth = new bignumber_js_1.default(1); }
        var tokens = new bignumber_js_1.default(tokens_sold);
        if (!(tokens.greaterThan(0)))
            throw new Error("ETH_SOLD NEGATIVE");
        if (!(min_eth.greaterThan(0)))
            throw new Error("MIN_TOKENS NEGATIVE");
        return this.getInputPrice(tokens, this.tokens, this.eth);
    };
    // # @notice Convert ETH to Tokens and transfers Tokens to recipient.
    // # @dev User specifies exact input (msg.value) and minimum output
    // # @param min_tokens Minimum Tokens bought.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param recipient The address that receives output Tokens.
    // # @return Amount of Tokens bought.
    // @public
    // @payable
    // def ethToTokenTransferInput(min_tokens: uint256, deadline: timestamp, recipient: address) -> uint256:
    // @private
    // def ethToTokenOutput(tokens_bought: uint256, max_eth: uint256(wei), deadline: timestamp, buyer: address, recipient: address) -> uint256(wei):
    State.prototype.ethToTokenOutput = function (tokens_bought, max_eth) {
        if (max_eth === void 0) { max_eth = new bignumber_js_1.default(1); }
        var tokens = new bignumber_js_1.default(tokens_bought);
        if (!(tokens.greaterThan(0)))
            throw new Error("TOKENS BOUGHT NEGATIVE");
        if (!(max_eth.greaterThan(0)))
            throw new Error("ETH BOUGHT NEGATIVE");
        return this.getOutputPrice(tokens, this.eth, this.tokens);
    };
    // # @notice Convert Tokens to ETH and transfers ETH to recipient.
    // # @dev User specifies exact input and minimum output.
    // # @param tokens_sold Amount of Tokens sold.
    // # @param min_eth Minimum ETH purchased.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param recipient The address that receives output ETH.
    // # @return Amount of ETH bought.
    // @private
    // def tokenToEthOutput(eth_bought: uint256(wei), max_tokens: uint256, deadline: timestamp, buyer: address, recipient: address) -> uint256:
    State.prototype.tokenToEthOutput = function (eth_bought, max_tokens) {
        if (max_tokens === void 0) { max_tokens = new bignumber_js_1.default(1); }
        var eth = new bignumber_js_1.default(eth_bought);
        if (!(eth.greaterThan(0)))
            throw new Error("NEGATIVE_ETH_BOUGHT");
        return this.getOutputPrice(eth, this.tokens, this.eth);
    };
    return State;
}());
exports.State = State;
