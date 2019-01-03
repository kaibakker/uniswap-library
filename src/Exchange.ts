import * as Web3 from 'web3';

import * as EXCHANGE_ABI from './abi/exchange.json';
import * as FACTORY_ABI from './abi/factory.json';
import * as ERC20_ABI from './abi/erc20.json';

import BN from 'bignumber.js'


import { setAddresses } from './addresses';

const NETWORK_ID = 1;
const PROVIDER_URL = "https://mainnet.infura.io/v3/83d36df8e3eb42c9a061340696c0bf55";
const addresses = setAddresses(NETWORK_ID)

const web3 = new Web3(PROVIDER_URL);

interface delta {
    eth: BN,
    tokens: BN,
    liquidity: BN
}

const deltaToString = function (delta) {
    return `delta(${delta.eth.toString()}, ${delta.tokens.toString()}, ${delta.liquidity.toString()})`;
}

export function Exchange(args) {
    this.name = args.name;
    this.symbol = args.symbol;
    this.tokenAddress = args.tokenAddress;
    this.exchangeAddress = args.exchangeAddress;
    this.decimals = args.decimals ? args.decimals : 0;
    this.ethReserve = new BN(args.ethReserve ? args.ethReserve : new BN(0));
    this.tokenReserve = new BN(args.tokenReserve ? args.tokenReserve : new BN(0));
    this.totalSupply = new BN(args.totalSupply ? args.totalSupply : new BN(0));
    this.deltas = [] as delta[];

    if (args.symbol) {
        this.exchangeAddress = addresses.payload.exchangeAddresses.addresses.filter((x) => { return x[0] === args.symbol })[0][1];
        this.tokenAddress = addresses.payload.tokenAddresses.addresses.filter((x) => { return x[0] === args.symbol })[0][1];
    } else if (args.tokenAddress) {
        this.exchangeAddress = addresses.payload.exchangeAddresses.fromToken[args.tokenAddress];
        this.tokenAddress = args.tokenAddress;
    }
}

Exchange.prototype.exchangeContract = function () {
    return new web3.eth.Contract(EXCHANGE_ABI, this.exchangeAddress);
}

Exchange.prototype.tokenContract = function () {
    return new web3.eth.Contract(ERC20_ABI, this.tokenAddress);
}

Exchange.prototype.exchangeTokenContract = function () {
    return new web3.eth.Contract(ERC20_ABI, this.exchangeAddress);
}

Exchange.prototype.factoryContract = function () {
    return new web3.eth.Contract(FACTORY_ABI, addresses.payload.factoryAddress);
}

Exchange.prototype.updateTotalSupply = async function () {
    this.totalSupply = new BN(await this.exchangeTokenContract().methods.totalSupply().call());
}

Exchange.prototype.updateTokenReserve = async function () {
    this.tokenReserve = new BN(await this.tokenContract().methods.balanceOf(this.exchangeAddress).call());
}

Exchange.prototype.updateEthReserve = async function () {
    this.ethReserve = new BN(await web3.eth.getBalance(this.exchangeAddress));
}

Exchange.prototype.updateSymbol = async function () {
    this.symbol = web3.utils.hexToString(await this.exchangeContract().methods.symbol().call());
}

Exchange.prototype.updateName = async function () {
    this.name = web3.utils.hexToString(await this.exchangeContract().methods.name().call());
}

Exchange.prototype.updateDecimals = async function () {
    this.decimals = parseInt(await this.exchangeContract().methods.decimals().call());
}

Exchange.prototype.updateTokenAddress = async function () {
    this.tokenAddress = await this.exchangeContract().methods.tokenAddress().call();
}

Exchange.prototype.syncBalancesWithLogs = function (done) {
    let options = {
        fromBlock: 6627944,
        toBlock: 'latest'
    };

    this.exchangeContract().getPastEvents("allEvents", options, (err, events) => {
        if (err) {
            return
        }
        console.log(this.toString());

        events.forEach((event) => {
            // console.log(event);
            const delta: delta = { eth: new BN(0), tokens: new BN(0), liquidity: new BN(0) }
            if (event.event === 'RemoveLiquidity') {
                // this.removeLiquidity(new BN(event.returnValues.eth_amount));
                delta.eth = new BN(event.returnValues.eth_amount).neg();
                delta.tokens = new BN(event.returnValues.token_amount).neg();
                const alternativeDelta = this.ethToTokenInput(new BN(event.eth_sold), new BN(event.tokens_bought))
                if (delta !== alternativeDelta) {
                    console.log(deltaToString(delta), deltaToString(alternativeDelta))
                }
            } else if (event.event === 'AddLiquidity') {
                // this.addLiquidity(new BN(event.returnValues.eth_amount));
                delta.eth = new BN(event.returnValues.eth_amount);
                delta.tokens = new BN(event.returnValues.token_amount);
                const alternativeDelta = this.ethToTokenInput(new BN(event.eth_sold), new BN(event.tokens_bought))
                if (delta !== alternativeDelta) {
                    console.log(deltaToString(delta), deltaToString(alternativeDelta))
                }
            } else if (event.event === 'EthPurchase') {
                // this.tokenToEthInput(new BN(event.eth_bought), new BN(event.tokens_sold))
                delta.eth = new BN(event.returnValues.eth_bought);
                delta.tokens = new BN(event.returnValues.tokens_sold).neg();
                const alternativeDelta = this.getTokenToEthInputPrice(new BN(event.eth_sold))
                if (delta !== alternativeDelta) {
                    console.log(deltaToString(delta), deltaToString(alternativeDelta))
                }
            } else if (event.event === 'TokenPurchase') {
                // this.ethToTokenInput(new BN(event.eth_sold), new BN(event.tokens_bought))
                delta.eth = new BN(event.returnValues.eth_sold).neg();
                delta.tokens = new BN(event.returnValues.tokens_bought);
                const alternativeDelta = this.ethToTokenInput(new BN(event.eth_sold), new BN(event.tokens_bought))
                if (delta !== alternativeDelta) {
                    console.log(deltaToString(delta), deltaToString(alternativeDelta))
                }
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
            // console.log(this.toString())
            this.performDelta(delta)
        })
        console.log(this.toString());
        done(this)
    })
}

Exchange.prototype.performDelta = function (delta) {
    this.ethReserve = this.ethReserve.plus(delta.eth);
    this.tokenReserve = this.tokenReserve.plus(delta.tokens);
    this.totalSupply = this.totalSupply.plus(delta.liquidity);
    this.deltas.push(delta as delta)
    this.valid()
    return this;
}

Exchange.prototype.toDelta = function () {
    let delta = {} as delta;
    delta.eth = this.ethReserve;
    delta.tokens = this.tokenReserve;
    delta.liquidity = this.totalSupply;
    return delta;
}

Exchange.prototype.toString = function () {
    return `delta(${this.ethReserve.toString()}, ${this.tokenReserve.toString()}, ${this.totalSupply.toString()})`;
}

Exchange.prototype.valid = function () {
    if (!this.ethReserve.gte(0)) throw new Error("NEGATIVE_ETH_RESERVE")
    if (!this.tokenReserve.gte(0)) throw new Error("NEGATIVE_TOKEN_RESERVE")
    if (!this.totalSupply.gte(0)) throw new Error("NEGATIVE_TOTAL_SUPPLY")
}

Exchange.prototype.validate = function () {
    const delta = {
        eth: this.deltas.reduce((sum: BN, delta: delta) => {
            return sum.plus(delta.eth)
        }, 0),
        tokens: this.deltas.reduce((sum: BN, delta: delta) => {
            return sum.plus(delta.tokens)
        }, 0),
        liquidity: this.deltas.reduce((sum: BN, delta: delta) => {
            return sum.plus(delta.liquidity)
        }, 0),
    } as delta;
    if (!this.ethReserve.equal(delta.eth)) throw new Error("NEGATIVE_ETH_RESERVE")
    if (!this.tokenReserve.equal(delta.tokens)) throw new Error("NEGATIVE_TOKEN_RESERVE")
    if (!this.totalSupply.equal(delta.liquidity)) throw new Error("NEGATIVE_TOTAL_SUPPLY")
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
//     assert deadline > block.timestamp and (max_tokens > 0 and msg.value > 0)
//     total_liquidity: uint256 = self.totalSupply
//     if total_liquidity > 0:
//         assert min_liquidity > 0
//         eth_reserve: uint256(wei) = self.balance - msg.value
//         token_reserve: uint256 = self.token.balanceOf(self)
//         token_amount: uint256 = msg.value * token_reserve / eth_reserve + 1
//         liquidity_minted: uint256 = msg.value * total_liquidity / eth_reserve
//         assert max_tokens >= token_amount and liquidity_minted >= min_liquidity
//         self.balances[msg.sender] += liquidity_minted
//         self.totalSupply = total_liquidity + liquidity_minted
//         assert self.token.transferFrom(msg.sender, self, token_amount)
//         log.AddLiquidity(msg.sender, msg.value, token_amount)
//         log.Transfer(ZERO_ADDRESS, msg.sender, liquidity_minted)
//         return liquidity_minted
//     else:
//         assert (self.factory != ZERO_ADDRESS and self.token != ZERO_ADDRESS) and msg.value >= 1000000000
//         assert self.factory.getExchange(self.token) == self
//         token_amount: uint256 = max_tokens
//         initial_liquidity: uint256 = as_unitless_number(self.balance)
//         self.totalSupply = initial_liquidity
//         self.balances[msg.sender] = initial_liquidity
//         assert self.token.transferFrom(msg.sender, self, token_amount)
//         log.AddLiquidity(msg.sender, msg.value, token_amount)
//         log.Transfer(ZERO_ADDRESS, msg.sender, initial_liquidity)
//         return initial_liquidity

Exchange.prototype.addLiquidity = function (
    eth = new BN(1),
    min_liquidity = new BN(1),
    max_tokens = new BN(10 ** 9)
): delta {
    if (!(max_tokens.greaterThan(0) && eth.greaterThan(0))) throw new Error("Error");
    const delta = { eth: eth } as delta
    if (this.totalSupply.greaterThan(0)) {
        if (!(min_liquidity.greaterThan(0))) throw new Error("Error");

        delta.tokens = eth.mul(this.tokenReserve).div(this.ethReserve).plus(1);
        delta.liquidity = eth.mul(this.totalSupply).div(this.ethReserve);
        if (!(max_tokens.greaterThanOrEqualTo(delta.tokens) && delta.liquidity.greaterThanOrEqualTo(min_liquidity))) throw new Error("Error");
    } else {
        delta.tokens = max_tokens
        delta.liquidity = eth
    }
    this.performDelta(delta)
    return delta
}

// # @dev Burn UNI tokens to withdraw ETH and Tokens at current ratio.
// # @param amount Amount of UNI burned.
// # @param min_eth Minimum ETH withdrawn.
// # @param min_tokens Minimum Tokens withdrawn.
// # @param deadline Time after which this transaction can no longer be executed.
// # @return The amount of ETH and Tokens withdrawn.
// @public
// def removeLiquidity(amount: uint256, min_eth: uint256(wei), min_tokens: uint256, deadline: timestamp) -> (uint256(wei), uint256):
//     assert (amount > 0 and deadline > block.timestamp) and (min_eth > 0 and min_tokens > 0)
//     total_liquidity: uint256 = self.totalSupply
//     assert total_liquidity > 0
//     token_reserve: uint256 = self.token.balanceOf(self)
//     eth_amount: uint256(wei) = amount * self.balance / total_liquidity
//     token_amount: uint256 = amount * token_reserve / total_liquidity
//     assert eth_amount >= min_eth and token_amount >= min_tokens
//     self.balances[msg.sender] -= amount
//     self.totalSupply = total_liquidity - amount
//     send(msg.sender, eth_amount)
//     assert self.token.transfer(msg.sender, token_amount)
//     log.RemoveLiquidity(msg.sender, eth_amount, token_amount)
//     log.Transfer(msg.sender, ZERO_ADDRESS, amount)
//     return eth_amount, token_amount

Exchange.prototype.removeLiquidity = function (
    amount = new BN(1),
    min_eth = new BN(1),
    min_tokens = new BN(1)
): delta {
    if (!(amount.greaterThan(0) && min_eth.greaterThan(0) && min_tokens.greaterThan(0))) return;
    if (!(this.totalSupply.greaterThan(0))) return;
    const eth_amount = amount.mul(this.ethReserve).div(this.totalSupply)
    const token_amount = amount.mul(this.tokenReserve).div(this.totalSupply)
    if (!(eth_amount.greaterThanOrEqualTo(min_eth) && token_amount.greaterThanOrEqualTo(min_tokens))) return;

    const delta = { eth: eth_amount.neg(), tokens: token_amount.neg(), liquidity: amount.neg() };
    this.performDelta(delta)
    return delta
}

// # @dev Pricing functon for converting between ETH and Tokens.
// # @param input_amount Amount of ETH or Tokens being sold.
// # @param input_reserve Amount of ETH or Tokens (input type) in exchange reserves.
// # @param output_reserve Amount of ETH or Tokens (output type) in exchange reserves.
// # @return Amount of ETH or Tokens bought.
// @private
// @constant
// def getInputPrice(input_amount: uint256, input_reserve: uint256, output_reserve: uint256) -> uint256:
//     assert input_reserve > 0 and output_reserve > 0
//     input_amount_with_fee: uint256 = input_amount * 997
//     numerator: uint256 = input_amount_with_fee * output_reserve
//     denominator: uint256 = (input_reserve * 1000) + input_amount_with_fee
//     return numerator / denominator


Exchange.prototype.getInputPrice = function (
    input_amount = new BN(1),
    input_reserve = this.ethReserve,
    output_reserve = this.tokenReserve
): delta {
    if (!(input_reserve.greaterThan(0) && output_reserve.greaterThan(0))) return;
    const input_amount_with_fee = input_amount.mul(997)
    const numerator = input_amount_with_fee.mul(output_reserve)
    const denominator = input_reserve.mul(1000).plus(input_amount_with_fee)
    return { tokens: numerator.div(denominator), eth: input_amount.neg(), liquidity: new BN(0) }
}

// # @dev Pricing functon for converting between ETH and Tokens.
// # @param output_amount Amount of ETH or Tokens being bought.
// # @param input_reserve Amount of ETH or Tokens (input type) in exchange reserves.
// # @param output_reserve Amount of ETH or Tokens (output type) in exchange reserves.
// # @return Amount of ETH or Tokens sold.
// @private
// @constant
// def getOutputPrice(output_amount: uint256, input_reserve: uint256, output_reserve: uint256) -> uint256:
//     assert input_reserve > 0 and output_reserve > 0
//     numerator: uint256 = input_reserve * output_amount * 1000
//     denominator: uint256 = (output_reserve - output_amount) * 997
//     return numerator / denominator + 1

Exchange.prototype.getOutputPrice = function (
    output_amount = new BN(1),
    input_reserve = this.ethReserve,
    output_reserve = this.tokenReserve
): delta {
    if (!(input_reserve.greaterThan(0) && output_reserve.greaterThan(0))) return;
    const numerator = input_reserve.mul(output_amount).mul(1000)
    const denominator = (output_reserve.minus(output_amount)).mul(997)
    return { tokens: numerator.div(denominator).plus(1).neg(), eth: output_amount, liquidity: new BN(0) }
}

// @private
// def ethToTokenInput(eth_sold: uint256(wei), min_tokens: uint256, deadline: timestamp, buyer: address, recipient: address) -> uint256:
//     assert deadline >= block.timestamp and (eth_sold > 0 and min_tokens > 0)
//     token_reserve: uint256 = self.token.balanceOf(self)
//     tokens_bought: uint256 = self.getInputPrice(as_unitless_number(eth_sold), as_unitless_number(self.balance - eth_sold), token_reserve)
//     assert tokens_bought >= min_tokens
//     assert self.token.transfer(recipient, tokens_bought)
//     log.TokenPurchase(buyer, eth_sold, tokens_bought)
//     return tokens_bought
Exchange.prototype.ethToTokenInput = function (
    eth_sold = new BN(1),
    min_tokens = new BN(1)
): delta {
    if (!(eth_sold.greaterThan(0))) throw new Error("ETH_SOLD NEGATIVE");
    if (!(min_tokens.greaterThan(0))) throw new Error("MIN_TOKENS NEGATIVE");
    const delta = this.getInputPrice(eth_sold);
    if (!(delta.tokens.gte(min_tokens))) return;

    this.performDelta(delta)

    return delta;
}



// # @notice Convert ETH to Tokens.
// # @dev User specifies exact input (msg.value).
// # @dev User cannot specify minimum output or deadline.
// @public
// @payable
// def __default__():
//     self.ethToTokenInput(msg.value, 1, block.timestamp, msg.sender, msg.sender)

// # @notice Convert ETH to Tokens.
// # @dev User specifies exact input (msg.value) and minimum output.
// # @param min_tokens Minimum Tokens bought.
// # @param deadline Time after which this transaction can no longer be executed.
// # @return Amount of Tokens bought.
// @public
// @payable
// def ethToTokenSwapInput(min_tokens: uint256, deadline: timestamp) -> uint256:
//     return self.ethToTokenInput(msg.value, min_tokens, deadline, msg.sender, msg.sender)

// # @notice Convert ETH to Tokens and transfers Tokens to recipient.
// # @dev User specifies exact input (msg.value) and minimum output
// # @param min_tokens Minimum Tokens bought.
// # @param deadline Time after which this transaction can no longer be executed.
// # @param recipient The address that receives output Tokens.
// # @return Amount of Tokens bought.
// @public
// @payable
// def ethToTokenTransferInput(min_tokens: uint256, deadline: timestamp, recipient: address) -> uint256:
//     assert recipient != self and recipient != ZERO_ADDRESS
//     return self.ethToTokenInput(msg.value, min_tokens, deadline, msg.sender, recipient)

// @private
// def ethToTokenOutput(tokens_bought: uint256, max_eth: uint256(wei), deadline: timestamp, buyer: address, recipient: address) -> uint256(wei):
//     assert deadline >= block.timestamp and (tokens_bought > 0 and max_eth > 0)
//     token_reserve: uint256 = self.token.balanceOf(self)
//     eth_sold: uint256 = self.getOutputPrice(tokens_bought, as_unitless_number(self.balance - max_eth), token_reserve)
//     # Throws if eth_sold > max_eth
//     eth_refund: uint256(wei) = max_eth - as_wei_value(eth_sold, 'wei')
//     if eth_refund > 0:
//         send(buyer, eth_refund)
//     assert self.token.transfer(recipient, tokens_bought)
//     log.TokenPurchase(buyer, as_wei_value(eth_sold, 'wei'), tokens_bought)
//     return as_wei_value(eth_sold, 'wei')

Exchange.prototype.ethToTokenOutput = function (
    tokens_bought = new BN(1),
    max_eth = new BN(1)
): delta {
    if (!(tokens_bought.greaterThan(0))) throw new Error("TOKENS BOUGHT NEGATIVE");
    if (!(max_eth.greaterThan(0))) throw new Error("ETH BOUGHT NEGATIVE");

    const delta = this.getOutputPrice(tokens_bought)

    this.performDelta(delta)

    return delta;
}


// # @notice Convert ETH to Tokens.
// # @dev User specifies maximum input (msg.value) and exact output.
// # @param tokens_bought Amount of tokens bought.
// # @param deadline Time after which this transaction can no longer be executed.
// # @return Amount of ETH sold.
// @public
// @payable
// def ethToTokenSwapOutput(tokens_bought: uint256, deadline: timestamp) -> uint256(wei):
//     return self.ethToTokenOutput(tokens_bought, msg.value, deadline, msg.sender, msg.sender)

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
//     assert deadline >= block.timestamp and (tokens_sold > 0 and min_eth > 0)
//     token_reserve: uint256 = self.token.balanceOf(self)
//     eth_bought: uint256 = self.getInputPrice(tokens_sold, token_reserve, as_unitless_number(self.balance))
//     wei_bought: uint256(wei) = as_wei_value(eth_bought, 'wei')
//     assert wei_bought >= min_eth
//     send(recipient, wei_bought)
//     assert self.token.transferFrom(buyer, self, tokens_sold)
//     log.EthPurchase(buyer, tokens_sold, wei_bought)
//     return wei_bought


// # @notice Convert Tokens to ETH.
// # @dev User specifies exact input and minimum output.
// # @param tokens_sold Amount of Tokens sold.
// # @param min_eth Minimum ETH purchased.
// # @param deadline Time after which this transaction can no longer be executed.
// # @return Amount of ETH bought.
// @public
// def tokenToEthSwapInput(tokens_sold: uint256, min_eth: uint256(wei), deadline: timestamp) -> uint256(wei):
//     return self.tokenToEthInput(tokens_sold, min_eth, deadline, msg.sender, msg.sender)

// # @notice Convert Tokens to ETH and transfers ETH to recipient.
// # @dev User specifies exact input and minimum output.
// # @param tokens_sold Amount of Tokens sold.
// # @param min_eth Minimum ETH purchased.
// # @param deadline Time after which this transaction can no longer be executed.
// # @param recipient The address that receives output ETH.
// # @return Amount of ETH bought.
// @public
// def tokenToEthTransferInput(tokens_sold: uint256, min_eth: uint256(wei), deadline: timestamp, recipient: address) -> uint256(wei):
//     assert recipient != self and recipient != ZERO_ADDRESS
//     return self.tokenToEthInput(tokens_sold, min_eth, deadline, msg.sender, recipient)

// @private
// def tokenToEthOutput(eth_bought: uint256(wei), max_tokens: uint256, deadline: timestamp, buyer: address, recipient: address) -> uint256:
//     assert deadline >= block.timestamp and eth_bought > 0
//     token_reserve: uint256 = self.token.balanceOf(self)
//     tokens_sold: uint256 = self.getOutputPrice(as_unitless_number(eth_bought), token_reserve, as_unitless_number(self.balance))
//     # tokens sold is always > 0
//     assert max_tokens >= tokens_sold
//     send(recipient, eth_bought)
//     assert self.token.transferFrom(buyer, self, tokens_sold)
//     log.EthPurchase(buyer, tokens_sold, eth_bought)
//     return tokens_sold


Exchange.prototype.tokenToEthOutput = function (
    eth_bought = new BN(1),
    max_tokens = new BN(1),
): delta {
    if (!(eth_bought.greaterThan(0))) throw new Error("NEGATIVE_ETH_BOUGHT");

    const delta = this.getOutputPrice(eth_bought)

    this.performDelta(delta)

    return delta;
}



// # @notice Convert Tokens to ETH.
// # @dev User specifies maximum input and exact output.
// # @param eth_bought Amount of ETH purchased.
// # @param max_tokens Maximum Tokens sold.
// # @param deadline Time after which this transaction can no longer be executed.
// # @return Amount of Tokens sold.
// @public
// def tokenToEthSwapOutput(eth_bought: uint256(wei), max_tokens: uint256, deadline: timestamp) -> uint256:
//     return self.tokenToEthOutput(eth_bought, max_tokens, deadline, msg.sender, msg.sender)

// # @notice Convert Tokens to ETH and transfers ETH to recipient.
// # @dev User specifies maximum input and exact output.
// # @param eth_bought Amount of ETH purchased.
// # @param max_tokens Maximum Tokens sold.
// # @param deadline Time after which this transaction can no longer be executed.
// # @param recipient The address that receives output ETH.
// # @return Amount of Tokens sold.
// @public
// def tokenToEthTransferOutput(eth_bought: uint256(wei), max_tokens: uint256, deadline: timestamp, recipient: address) -> uint256:
//     assert recipient != self and recipient != ZERO_ADDRESS
//     return self.tokenToEthOutput(eth_bought, max_tokens, deadline, msg.sender, recipient)

// @private
// def tokenToTokenInput(tokens_sold: uint256, min_tokens_bought: uint256, min_eth_bought: uint256(wei), deadline: timestamp, buyer: address, recipient: address, exchange_addr: address) -> uint256:
//     assert (deadline >= block.timestamp and tokens_sold > 0) and (min_tokens_bought > 0 and min_eth_bought > 0)
//     assert exchange_addr != self and exchange_addr != ZERO_ADDRESS
//     token_reserve: uint256 = self.token.balanceOf(self)
//     eth_bought: uint256 = self.getInputPrice(tokens_sold, token_reserve, as_unitless_number(self.balance))
//     wei_bought: uint256(wei) = as_wei_value(eth_bought, 'wei')
//     assert wei_bought >= min_eth_bought
//     assert self.token.transferFrom(buyer, self, tokens_sold)
//     tokens_bought: uint256 = Exchange(exchange_addr).ethToTokenTransferInput(min_tokens_bought, deadline, recipient, value=wei_bought)
//     log.EthPurchase(buyer, tokens_sold, wei_bought)
//     return tokens_bought

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
//     exchange_addr: address = self.factory.getExchange(token_addr)
//     return self.tokenToTokenInput(tokens_sold, min_tokens_bought, min_eth_bought, deadline, msg.sender, msg.sender, exchange_addr)

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
//     exchange_addr: address = self.factory.getExchange(token_addr)
//     return self.tokenToTokenInput(tokens_sold, min_tokens_bought, min_eth_bought, deadline, msg.sender, recipient, exchange_addr)

// @private
// def tokenToTokenOutput(tokens_bought: uint256, max_tokens_sold: uint256, max_eth_sold: uint256(wei), deadline: timestamp, buyer: address, recipient: address, exchange_addr: address) -> uint256:
//     assert deadline >= block.timestamp and (tokens_bought > 0 and max_eth_sold > 0)
//     assert exchange_addr != self and exchange_addr != ZERO_ADDRESS
//     eth_bought: uint256(wei) = Exchange(exchange_addr).getEthToTokenOutputPrice(tokens_bought)
//     token_reserve: uint256 = self.token.balanceOf(self)
//     tokens_sold: uint256 = self.getOutputPrice(as_unitless_number(eth_bought), token_reserve, as_unitless_number(self.balance))
//     # tokens sold is always > 0
//     assert max_tokens_sold >= tokens_sold and max_eth_sold >= eth_bought
//     assert self.token.transferFrom(buyer, self, tokens_sold)
//     eth_sold: uint256(wei) = Exchange(exchange_addr).ethToTokenTransferOutput(tokens_bought, deadline, recipient, value=eth_bought)
//     log.EthPurchase(buyer, tokens_sold, eth_bought)
//     return tokens_sold

// # @notice Convert Tokens (self.token) to Tokens (token_addr).
// # @dev User specifies maximum input and exact output.
// # @param tokens_bought Amount of Tokens (token_addr) bought.
// # @param max_tokens_sold Maximum Tokens (self.token) sold.
// # @param max_eth_sold Maximum ETH purchased as intermediary.
// # @param deadline Time after which this transaction can no longer be executed.
// # @param token_addr The address of the token being purchased.
// # @return Amount of Tokens (self.token) sold.
// @public
// def tokenToTokenSwapOutput(tokens_bought: uint256, max_tokens_sold: uint256, max_eth_sold: uint256(wei), deadline: timestamp, token_addr: address) -> uint256:
//     exchange_addr: address = self.factory.getExchange(token_addr)
//     return self.tokenToTokenOutput(tokens_bought, max_tokens_sold, max_eth_sold, deadline, msg.sender, msg.sender, exchange_addr)

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
//     exchange_addr: address = self.factory.getExchange(token_addr)
//     return self.tokenToTokenOutput(tokens_bought, max_tokens_sold, max_eth_sold, deadline, msg.sender, recipient, exchange_addr)

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
// def tokenToExchangeSwapInput(tokens_sold: uint256, min_tokens_bought: uint256, min_eth_bought: uint256(wei), deadline: timestamp, exchange_addr: address) -> uint256:
//     return self.tokenToTokenInput(tokens_sold, min_tokens_bought, min_eth_bought, deadline, msg.sender, msg.sender, exchange_addr)

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
// def tokenToExchangeTransferInput(tokens_sold: uint256, min_tokens_bought: uint256, min_eth_bought: uint256(wei), deadline: timestamp, recipient: address, exchange_addr: address) -> uint256:
//     assert recipient != self
//     return self.tokenToTokenInput(tokens_sold, min_tokens_bought, min_eth_bought, deadline, msg.sender, recipient, exchange_addr)

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
// def tokenToExchangeSwapOutput(tokens_bought: uint256, max_tokens_sold: uint256, max_eth_sold: uint256(wei), deadline: timestamp, exchange_addr: address) -> uint256:
//     return self.tokenToTokenOutput(tokens_bought, max_tokens_sold, max_eth_sold, deadline, msg.sender, msg.sender, exchange_addr)

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
// def tokenToExchangeTransferOutput(tokens_bought: uint256, max_tokens_sold: uint256, max_eth_sold: uint256(wei), deadline: timestamp, recipient: address, exchange_addr: address) -> uint256:
//     assert recipient != self
//     return self.tokenToTokenOutput(tokens_bought, max_tokens_sold, max_eth_sold, deadline, msg.sender, recipient, exchange_addr)

// # @notice Public price function for ETH to Token trades with an exact input.
// # @param eth_sold Amount of ETH sold.
// # @return Amount of Tokens that can be bought with input ETH.
// @public
// @constant
// def getEthToTokenInputPrice(eth_sold: uint256(wei)) -> uint256:
//     assert eth_sold > 0
//     token_reserve: uint256 = self.token.balanceOf(self)
//     return self.getInputPrice(as_unitless_number(eth_sold), as_unitless_number(self.balance), token_reserve)

// # @notice Public price function for ETH to Token trades with an exact output.
// # @param tokens_bought Amount of Tokens bought.
// # @return Amount of ETH needed to buy output Tokens.
// @public
// @constant
// def getEthToTokenOutputPrice(tokens_bought: uint256) -> uint256(wei):
//     assert tokens_bought > 0
//     token_reserve: uint256 = self.token.balanceOf(self)
//     eth_sold: uint256 = self.getOutputPrice(tokens_bought, as_unitless_number(self.balance), token_reserve)
//     return as_wei_value(eth_sold, 'wei')

// # @notice Public price function for Token to ETH trades with an exact input.
// # @param tokens_sold Amount of Tokens sold.
// # @return Amount of ETH that can be bought with input Tokens.
// @public
// @constant
// def getTokenToEthInputPrice(tokens_sold: uint256) -> uint256(wei):
//     assert tokens_sold > 0
//     token_reserve: uint256 = self.token.balanceOf(self)
//     eth_bought: uint256 = self.getInputPrice(tokens_sold, token_reserve, as_unitless_number(self.balance))
//     return as_wei_value(eth_bought, 'wei')

// # @notice Public price function for Token to ETH trades with an exact output.
// # @param eth_bought Amount of output ETH.
// # @return Amount of Tokens needed to buy output ETH.
// @public
// @constant
// def getTokenToEthOutputPrice(eth_bought: uint256(wei)) -> uint256:
//     assert eth_bought > 0
//     token_reserve: uint256 = self.token.balanceOf(self)
//     return self.getOutputPrice(as_unitless_number(eth_bought), token_reserve, as_unitless_number(self.balance))


Exchange.prototype.neutralPrice = function () {
    return this.tokenReserve.div(this.ethReserve);
}

Exchange.prototype.reserve = function () {
    return this.tokenReserve.mul(this.ethReserve);
}

Exchange.prototype.makeToPrice = function (price, max_liquidity) {
    let delta = {
        eth: this.reserve().div(new BN(price)).sqrt().minus(this.ethReserve)
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

