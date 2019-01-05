import * as Web3 from 'web3';

import BN from 'bignumber.js'


import { Trade } from './Trade'
import { Delta } from './Delta'



export class State {
    delta: Delta;
    nextTx?: Trade
    prevTx?: Trade;

    constructor(delta: Delta) {
        this.delta = delta
    }

    createTxFromEvent(event) {
        const delta = new Delta();
        if (event.event === 'RemoveLiquidity') {
            // this.removeLiquidity(new BN(event.returnValues.eth_amount));
            delta.eth = new BN(event.returnValues.eth_amount).neg();
            delta.tokens = new BN(event.returnValues.token_amount).neg();
        } else if (event.event === 'AddLiquidity') {
            // this.addLiquidity(new BN(event.returnValues.eth_amount));
            delta.eth = new BN(event.returnValues.eth_amount);
            delta.tokens = new BN(event.returnValues.token_amount);
        } else if (event.event === 'EthPurchase') {
            // this.tokenToEthInput(new BN(event.eth_bought), new BN(event.tokens_sold))
            delta.eth = new BN(event.returnValues.eth_bought);
            delta.tokens = new BN(event.returnValues.tokens_sold).neg();
        } else if (event.event === 'TokenPurchase') {
            // this.ethToTokenInput(new BN(event.eth_sold), new BN(event.tokens_bought))
            delta.eth = new BN(event.returnValues.eth_sold).neg();
            delta.tokens = new BN(event.returnValues.tokens_bought);
        } else if (event.event === 'Transfer') {
            if (event.returnValues._from === '0x0000000000000000000000000000000000000000') {
                // this.deltas.push(this.addLiquidity(new BN(event.returnValues._value)));
                delta.liquidity = new BN(event.returnValues._value);
            } else if (event.returnValues._to === '0x0000000000000000000000000000000000000000') {
                // this.deltas.push(this.removeLiquidity(new BN(event.returnValues._value)));
                delta.liquidity = new BN(event.returnValues._value).neg();
            } else {
                return;
            }
        }
        return this.performDelta(delta);
    }


    performDelta(delta: Delta) {
        const toState = new State(this.delta.plus(delta))
        return new Trade(toState, this, delta)
    }

    tokenReserve(): BN {
        return this.delta.tokens;
    }

    totalSupply(): BN {
        return this.delta.liquidity;
    }

    toString(): string {
        return this.delta.toString();
    }

    valid() {
        if (!this.delta.eth.gte(0)) throw new Error("NEGATIVE_ETH_RESERVE")
        if (!this.tokenReserve().gte(0)) throw new Error("NEGATIVE_TOKEN_RESERVE")
        if (!this.totalSupply().gte(0)) throw new Error("NEGATIVE_TOTAL_SUPPLY")
    }

    // # @notice Deposit ETH and Tokens (self.token) at current ratio to mint UNI tokens.
    // # @dev min_amount has a djfferent meaning when total UNI supply is 0.
    // # @param min_liquidity Minimum number of UNI sender will mint if total UNI supply is greater than 0.
    // # @param min_amount Maximum number of tokens deposited. Deposits max amount if total UNI supply is 0.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @return The amount of UNI minted.
    // @public
    // @payable
    // def addLiquidity(min_liquidity: uint256, max_tokens: uint256, deadline: timestamp) -> uint256:

    addLiquidity(
        eth = new BN(1),
        min_liquidity = new BN(1),
        max_tokens = new BN(10 ** 9)
    ): Trade {
        if (!(max_tokens.greaterThan(0) && eth.greaterThan(0))) throw new Error("Error");
        const delta = new Delta(eth)
        if (this.totalSupply().greaterThan(0)) {
            if (!(min_liquidity.greaterThan(0))) throw new Error("Error");

            delta.tokens = eth.mul(this.tokenReserve()).div(this.delta.eth).plus(1);
            delta.liquidity = eth.mul(this.totalSupply()).div(this.delta.eth);
            if (!(max_tokens.greaterThanOrEqualTo(delta.tokens) && delta.liquidity.greaterThanOrEqualTo(min_liquidity))) throw new Error("Error");
        } else {
            delta.tokens = max_tokens
            delta.liquidity = eth
        }
        return this.performDelta(delta)
    }

    // # @dev Burn UNI tokens to withdraw ETH and Tokens at current ratio.
    // # @param amount Amount of UNI burned.
    // # @param min_eth Minimum ETH withdrawn.
    // # @param min_tokens Minimum Tokens withdrawn.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @return The amount of ETH and Tokens withdrawn.
    // @public
    // def removeLiquidity(amount: uint256, min_eth: uint256(wei), min_tokens: uint256, deadline: timestamp) -> (uint256(wei), uint256):

    removeLiquidity(
        amount = new BN(1),
        min_eth = new BN(1),
        min_tokens = new BN(1)
    ): Trade {
        if (!(amount.greaterThan(0) && min_eth.greaterThan(0) && min_tokens.greaterThan(0))) return;
        if (!(this.totalSupply().greaterThan(0))) return;
        const eth_amount = amount.mul(this.delta.eth).div(this.totalSupply())
        const token_amount = amount.mul(this.tokenReserve()).div(this.totalSupply())
        if (!(eth_amount.greaterThanOrEqualTo(min_eth) && token_amount.greaterThanOrEqualTo(min_tokens))) return;

        const delta = new Delta(eth_amount.neg(), token_amount.neg(), amount.neg());
        return this.performDelta(delta)

    }

    // # @dev Pricing functon for converting between ETH and Tokens.
    // # @param input_amount Amount of ETH or Tokens being sold.
    // # @param input_reserve Amount of ETH or Tokens (input type) in exchange reserves.
    // # @param output_reserve Amount of ETH or Tokens (output type) in exchange reserves.
    // # @return Amount of ETH or Tokens bought.
    // @private
    // @constant
    // def getInputPrice(input_amount: uint256, input_reserve: uint256, output_reserve: uint256) -> uint256:


    getInputPrice(
        input_amount,
        input_reserve,
        output_reserve
    ): Trade {
        if (!(input_reserve.greaterThan(0) && output_reserve.greaterThan(0))) return;
        const input_amount_with_fee = input_amount.mul(997)
        const numerator = input_amount_with_fee.mul(output_reserve)
        const denominator = input_reserve.mul(1000).plus(input_amount_with_fee)
        const delta = new Delta(numerator.div(denominator), input_amount.neg(), new BN(0))
        return this.performDelta(delta);
    }

    // # @dev Pricing functon for converting between ETH and Tokens.
    // # @param output_amount Amount of ETH or Tokens being bought.
    // # @param input_reserve Amount of ETH or Tokens (input type) in exchange reserves.
    // # @param output_reserve Amount of ETH or Tokens (output type) in exchange reserves.
    // # @return Amount of ETH or Tokens sold.
    // @private
    // @constant
    // def getOutputPrice(output_amount: uint256, input_reserve: uint256, output_reserve: uint256) -> uint256:


    getOutputPrice(
        output_amount,
        input_reserve,
        output_reserve
    ): Trade {
        if (!(input_reserve.greaterThan(0) && output_reserve.greaterThan(0))) return;
        const numerator = input_reserve.mul(output_amount).mul(1000)
        const denominator = (output_reserve.minus(output_amount)).mul(997)
        const delta = new Delta(numerator.div(denominator).plus(1).neg(), output_amount, new BN(0))
        return this.performDelta(delta)
    }

    // @private
    // def ethToTokenInput(eth_sold: uint256(wei), min_tokens: uint256, deadline: timestamp, buyer: address, recipient: address) -> uint256:

    ethToTokenInput(
        eth_sold = new BN(1),
        min_tokens = new BN(1)
    ): Trade {
        if (!(eth_sold.greaterThan(0))) throw new Error("ETH_SOLD NEGATIVE");
        if (!(min_tokens.greaterThan(0))) throw new Error("MIN_TOKENS NEGATIVE");
        return this.getInputPrice(eth_sold, this.delta.eth, this.tokenReserve);
    }



    // # @notice Convert ETH to Tokens.
    // # @dev User specifies exact input (msg.value).
    // # @dev User cannot specify minimum output or deadline.

    // # @notice Convert ETH to Tokens.
    // # @dev User specifies exact input (msg.value) and minimum output.
    // # @param min_tokens Minimum Tokens bought.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @return Amount of Tokens bought.
    // @public
    // @payable
    // def ethToTokenSwapInput(min_tokens: uint256, deadline: timestamp) -> uint256:

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


    ethToTokenOutput(
        tokens_bought = new BN(1),
        max_eth = new BN(1)
    ): Trade {
        if (!(tokens_bought.greaterThan(0))) throw new Error("TOKENS BOUGHT NEGATIVE");
        if (!(max_eth.greaterThan(0))) throw new Error("ETH BOUGHT NEGATIVE");

        return this.getOutputPrice(tokens_bought, this.delta.eth, this.tokenReserve)
    }


    // # @notice Convert ETH to Tokens.
    // # @dev User specifies maximum input (msg.value) and exact output.
    // # @param tokens_bought Amount of tokens bought.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @return Amount of ETH sold.
    // @public
    // @payable
    // def ethToTokenSwapOutput(tokens_bought: uint256, deadline: timestamp) -> uint256(wei):

    // # @notice Convert ETH to Tokens and transfers Tokens to recipient.
    // # @dev User specifies maximum input (msg.value) and exact output.
    // # @param tokens_bought Amount of tokens bought.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param recipient The address that receives output Tokens.
    // # @return Amount of ETH sold.
    // @public
    // @payable
    // def ethToTokenTransferOutput(tokens_bought: uint256, deadline: timestamp, recipient: address) -> uint256(wei):
    //     assert recipient != self and recipient != ZERO_ADDRESS
    //     return self.ethToTokenOutput(tokens_bought, msg.value, deadline, msg.sender, recipient)

    // @private
    // def tokenToEthInput(tokens_sold: uint256, min_eth: uint256(wei), deadline: timestamp, buyer: address, recipient: address) -> uint256(wei):


    // # @notice Convert Tokens to ETH.
    // # @dev User specifies exact input and minimum output.
    // # @param tokens_sold Amount of Tokens sold.
    // # @param min_eth Minimum ETH purchased.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @return Amount of ETH bought.
    // @public
    // def tokenToEthSwapInput(tokens_sold: uint256, min_eth: uint256(wei), deadline: timestamp) -> uint256(wei):

    // # @notice Convert Tokens to ETH and transfers ETH to recipient.
    // # @dev User specifies exact input and minimum output.
    // # @param tokens_sold Amount of Tokens sold.
    // # @param min_eth Minimum ETH purchased.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param recipient The address that receives output ETH.
    // # @return Amount of ETH bought.
    // @public
    // def tokenToEthTransferInput(tokens_sold: uint256, min_eth: uint256(wei), deadline: timestamp, recipient: address) -> uint256(wei):

    // @private
    // def tokenToEthOutput(eth_bought: uint256(wei), max_tokens: uint256, deadline: timestamp, buyer: address, recipient: address) -> uint256:



    tokenToEthOutput(
        eth_bought = new BN(1),
        max_tokens = new BN(1),
    ): Trade {
        if (!(eth_bought.greaterThan(0))) throw new Error("NEGATIVE_ETH_BOUGHT");

        return this.getOutputPrice(eth_bought, this.tokenReserve, this.delta.eth)
    }



    // # @notice Convert Tokens to ETH.
    // # @dev User specifies maximum input and exact output.
    // # @param eth_bought Amount of ETH purchased.
    // # @param max_tokens Maximum Tokens sold.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @return Amount of Tokens sold.
    // @public
    // def tokenToEthSwapOutput(eth_bought: uint256(wei), max_tokens: uint256, deadline: timestamp) -> uint256:

    // # @notice Convert Tokens to ETH and transfers ETH to recipient.
    // # @dev User specifies maximum input and exact output.
    // # @param eth_bought Amount of ETH purchased.
    // # @param max_tokens Maximum Tokens sold.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param recipient The address that receives output ETH.
    // # @return Amount of Tokens sold.
    // @public
    // def tokenToEthTransferOutput(eth_bought: uint256(wei), max_tokens: uint256, deadline: timestamp, recipient: address) -> uint256:

    // @private
    // def tokenToTokenInput(tokens_sold: uint256, min_tokens_bought: uint256, min_eth_bought: uint256(wei), deadline: timestamp, buyer: address, recipient: address, exchange_addr: address) -> uint256:


    // # @notice Convert Tokens (self.token) to Tokens (token_addr).
    // # @dev User specifies exact input and minimum output.
    // # @param tokens_sold Amount of Tokens sold.
    // # @param min_tokens_bought Minimum Tokens (token_addr) purchased.
    // # @param min_eth_bought Minimum ETH purchased as intermediary.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param token_addr The address of the token being purchased.
    // # @return Amount of Tokens (token_addr) bought.
    // @public
    // def tokenToTokenSwapInput(tokens_sold: uint256, min_tokens_bought: uint256, min_eth_bought: uint256(wei), deadline: timestamp, token_addr: address) -> uint256:

    // # @notice Convert Tokens (self.token) to Tokens (token_addr) and transfers
    // #         Tokens (token_addr) to recipient.
    // # @dev User specifies exact input and minimum output.
    // # @param tokens_sold Amount of Tokens sold.
    // # @param min_tokens_bought Minimum Tokens (token_addr) purchased.
    // # @param min_eth_bought Minimum ETH purchased as intermediary.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param recipient The address that receives output ETH.
    // # @param token_addr The address of the token being purchased.
    // # @return Amount of Tokens (token_addr) bought.
    // @public
    // def tokenToTokenTransferInput(tokens_sold: uint256, min_tokens_bought: uint256, min_eth_bought: uint256(wei), deadline: timestamp, recipient: address, token_addr: address) -> uint256:

    // @private
    // def tokenToTokenOutput(tokens_bought: uint256, max_tokens_sold: uint256, max_eth_sold: uint256(wei), deadline: timestamp, buyer: address, recipient: address, exchange_addr: address) -> uint256:

    // # @notice Convert Tokens (self.token) to Tokens (token_addr).
    // # @dev User specifies maximum input and exact output.
    // # @param tokens_bought Amount of Tokens (token_addr) bought.
    // # @param max_tokens_sold Maximum Tokens (self.token) sold.
    // # @param max_eth_sold Maximum ETH purchased as intermediary.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param token_addr The address of the token being purchased.
    // # @return Amount of Tokens (self.token) sold.
    // @public

    // # @notice Convert Tokens (self.token) to Tokens (token_addr) and transfers
    // #         Tokens (token_addr) to recipient.
    // # @dev User specifies maximum input and exact output.
    // # @param tokens_bought Amount of Tokens (token_addr) bought.
    // # @param max_tokens_sold Maximum Tokens (self.token) sold.
    // # @param max_eth_sold Maximum ETH purchased as intermediary.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param recipient The address that receives output ETH.
    // # @param token_addr The address of the token being purchased.
    // # @return Amount of Tokens (self.token) sold.
    // @public
    // def tokenToTokenTransferOutput(tokens_bought: uint256, max_tokens_sold: uint256, max_eth_sold: uint256(wei), deadline: timestamp, recipient: address, token_addr: address) -> uint256:

    // # @notice Convert Tokens (self.token) to Tokens (exchange_addr.token).
    // # @dev Allows trades through contracts that were not deployed from the same factory.
    // # @dev User specifies exact input and minimum output.
    // # @param tokens_sold Amount of Tokens sold.
    // # @param min_tokens_bought Minimum Tokens (token_addr) purchased.
    // # @param min_eth_bought Minimum ETH purchased as intermediary.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param exchange_addr The address of the exchange for the token being purchased.
    // # @return Amount of Tokens (exchange_addr.token) bought.
    // @public
    // def tokenToStateSwapInput(tokens_sold: uint256, min_tokens_bought: uint256, min_eth_bought: uint256(wei), deadline: timestamp, exchange_addr: address) -> uint256:

    // # @notice Convert Tokens (self.token) to Tokens (exchange_addr.token) and transfers
    // #         Tokens (exchange_addr.token) to recipient.
    // # @dev Allows trades through contracts that were not deployed from the same factory.
    // # @dev User specifies exact input and minimum output.
    // # @param tokens_sold Amount of Tokens sold.
    // # @param min_tokens_bought Minimum Tokens (token_addr) purchased.
    // # @param min_eth_bought Minimum ETH purchased as intermediary.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param recipient The address that receives output ETH.
    // # @param exchange_addr The address of the exchange for the token being purchased.
    // # @return Amount of Tokens (exchange_addr.token) bought.
    // @public
    // def tokenToStateTransferInput(tokens_sold: uint256, min_tokens_bought: uint256, min_eth_bought: uint256(wei), deadline: timestamp, recipient: address, exchange_addr: address) -> uint256:

    // # @notice Convert Tokens (self.token) to Tokens (exchange_addr.token).
    // # @dev Allows trades through contracts that were not deployed from the same factory.
    // # @dev User specifies maximum input and exact output.
    // # @param tokens_bought Amount of Tokens (token_addr) bought.
    // # @param max_tokens_sold Maximum Tokens (self.token) sold.
    // # @param max_eth_sold Maximum ETH purchased as intermediary.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param exchange_addr The address of the exchange for the token being purchased.
    // # @return Amount of Tokens (self.token) sold.
    // @public
    // def tokenToStateSwapOutput(tokens_bought: uint256, max_tokens_sold: uint256, max_eth_sold: uint256(wei), deadline: timestamp, exchange_addr: address) -> uint256:

    // # @notice Convert Tokens (self.token) to Tokens (exchange_addr.token) and transfers
    // #         Tokens (exchange_addr.token) to recipient.
    // # @dev Allows trades through contracts that were not deployed from the same factory.
    // # @dev User specifies maximum input and exact output.
    // # @param tokens_bought Amount of Tokens (token_addr) bought.
    // # @param max_tokens_sold Maximum Tokens (self.token) sold.
    // # @param max_eth_sold Maximum ETH purchased as intermediary.
    // # @param deadline Time after which this transaction can no longer be executed.
    // # @param recipient The address that receives output ETH.
    // # @param token_addr The address of the token being purchased.
    // # @return Amount of Tokens (self.token) sold.
    // @public

    // # @notice Public price function for ETH to Token trades with an exact input.
    // # @param eth_sold Amount of ETH sold.
    // # @return Amount of Tokens that can be bought with input ETH.
    // @public
    // @constant

    // # @notice Public price function for ETH to Token trades with an exact output.
    // # @param tokens_bought Amount of Tokens bought.
    // # @return Amount of ETH needed to buy output Tokens.
    // @public
    // @constant
    // def getEthToTokenOutputPrice(tokens_bought: uint256) -> uint256(wei):

    // # @notice Public price function for Token to ETH trades with an exact input.
    // # @param tokens_sold Amount of Tokens sold.
    // # @return Amount of ETH that can be bought with input Tokens.
    // @public
    // @constant
    // def getTokenToEthInputPrice(tokens_sold: uint256) -> uint256(wei):


    // # @notice Public price function for Token to ETH trades with an exact output.
    // # @param eth_bought Amount of output ETH.
    // # @return Amount of Tokens needed to buy output ETH.
    // @public
    // @constant
    // def getTokenToEthOutputPrice(eth_bought: uint256(wei)) -> uint256:

    neutralPrice(): BN {
        return this.tokenReserve().div(this.delta.eth);
    }

    reserve(): BN {
        return this.tokenReserve().mul(this.delta.eth);
    }

    makeToPrice(price, max_liquidity): Trade {
        let delta = {
            eth: this.reserve().div(new BN(price)).sqrt().minus(this.delta.eth)
        }

        if (delta.eth.gt(0)) {
            if (max_liquidity) {
                delta.eth = BN.min(delta.eth, max_liquidity)
            }
            return this.ethToTokenInput(delta.eth);
        } else {
            if (max_liquidity) {
                delta.eth = BN.min(delta.eth.neg(), max_liquidity)
            } else {
                delta.eth = delta.eth.neg()
            }
            return this.tokenToEthOutput(delta.eth);
        }
    }

}