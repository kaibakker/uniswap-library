'use strict';
const chai = require('chai');
const BN = require("bignumber.js")

chai.use(require('chai-bignumber')(BN));
const expect = chai.expect;
const { State } = require('../lib/State.js');
const { Delta } = require('../lib/Delta.js');
const { Exchange } = require('../lib/Exchange.js');


const start = new Delta(5, new BN(100), new BN(1));
const negativeLiquidity = new Delta(new BN(5), new BN(100), new BN(-1));
const negativeEth = new Delta(new BN(-5), new BN(100), new BN(1));
const negativeTokens = new Delta(new BN(5), new BN(-100), new BN(1))



const delta1 = new Delta(5, 100, 5)
const delta2 = new Delta(5, 100, 5)
const delta3 = new Delta(5, 100, 5)
const delta4 = new Delta(5, 100, 5)
const delta5 = new Delta(5, 100, 5)
const delta6 = new Delta(5, 100, 5)
const delta7 = new Delta(5, 100, 5)
const delta8 = new Delta(5, 100, 5)
const delta9 = new Delta(5, 100, 5)
const delta10 = new Delta(5, 100, 5)
const delta11 = new Delta(5, 100, 5)
const delta12 = new Delta(5, 100, 5)

const state1 = new State(12, 12);
describe('class State', () => {
    it('trade() works correctly', () => {
        let trade = state1.trade(delta1)

        // expect(state.tokenReserve).to.be.bignumber.equal(start.tokens);
        // expect(state.totalSupply).to.be.bignumber.equal(start.liquidity);
        // expect(state.ethReserve).to.be.bignumber.equal(start.eth);
        // expect(state.symbol).to.equal(undefined);
    });

    it('trade() throws on negative liquidity', () => {
        const state = new State(0, 0, 0)

        expect(state.trade.bind(state, negativeLiquidity)).to.throw("NEGATIVE_TOTAL_SUPPLY")
    });

    it('trade() throws on negative eth', () => {
        const state = new State(0, 0, 0)

        expect(state.trade.bind(state, negativeEth)).to.throw("NEGATIVE_ETH_RESERVE")
    });

    it('trade() throws on negative tokens', () => {
        const state = new State(0, 0, 0)

        // expect(state.trade.bind(state, negativeTokens)).to.throw("NEGATIVE_TOKEN_RESERVE")
    });

    it('addLiquidity() works correctly', () => {
        let state = new State(10, 1000, 10)
        // let trade1 = state.trade(3, 5, 0)
        // let trade2 = new State(0, 0, 0).tradeTokens(3) // buy 3 tokens with Eth
        // let trade3 = trade2.state.tradeTokens(-3).maxTokens(100) // sell 3 tokens for eth / buy eth for 3 tokens
        // let event = state3.state.tokenToEthOutput(3).maxEth(10).maxBlock().minToken(12312)
        // let trade2 = new State(0, 0, 0).tokenToEthOutput(10, maxToken)
        // let trade2 = new State(0, 0, 0).tradeLiquidity(3)




        const change = state.addLiquidity(delta2.eth)
        // expect(change.eth).to.be.bignumber.equal(delta2.eth);
        // expect(change.tokens).to.be.bignumber.equal(delta2.tokens);
        // expect(change.liquidity).to.be.bignumber.equal(delta2.liquidity);
    });

    it('removeLiquidity() works correctly', () => {
        const liquidity = new BN(1)
        let state = new State(10, 1000, 10)
        const change = state.removeLiquidity(liquidity)

        // expect(change.eth).to.be.bignumber.equal(-1);
        // expect(state.ethReserve).to.be.bignumber.equal(4);
        // expect(state.tokenReserve).to.be.bignumber.equal(80);
        // expect(state.totalSupply).to.be.bignumber.equal(4);
    });

    it('ethToTokenOutput() for positive eth', () => {
        let state = new State(10, 1000, 10)
        // state.trade(delta);
        const trade = state.ethToTokenOutput(delta3.eth)
        expect(trade.eth).to.be.bignumber.equal(-delta4.eth)
        // expect(delta4.tokens.gte(16)).to.be.true()
        // expect(new State(0, 0 ,0).trade(delta).trade(delta4)).to.be.equal(state);
    })


    it('tokenToEthOutput()', () => {
        let trade = new State(10, 1000).tokenToEthOutput(10)

        expect(trade).to.be.bignumber.equal(16.6249791562447890612)
    })

    it('neutralPrice() works correctly', () => {
        let state = new State(10, 1000)
        const price = state.neutralPrice()

        expect(price).to.be.bignumber.equal(100);
    });

    it('ethToTokenOutput() works correctly', () => {
        let state = new State(10, 1000, 10)
        const change = state.ethToTokenOutput(432)

        // expect(change.eth).to.be.bignumber.equal(deltaEth);
        // expect(change.liquidity).to.be.bignumber.equal(0);
        // expect(state.ethReserve).to.be.bignumber.equal(4);
        // expect(state.tokenReserve).to.be.bignumber.equal(80);
        // expect(state.totalSupply).to.be.bignumber.equal(4);
    });

    xit('double sync check', async () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')
        const state1 = await exchange.getState();
        const state2 = await exchange.getStateFromLogs();
        expect(state1.delta.liquidity).to.be.equal(state2.delta.liquidity)
    }).timeout(70000);

    it('should tradeToPrice() correctly', () => {
        let state = new State(10, 1000, 10)
        const p1 = new BN(10);

        // expect(.lt(0.01)).to.be.true;
        console.log(state.toString())
        const p2 = new BN(20);

        // expect(state.neutralPrice().minus(p2).lt(0.01)).to.be.true;
        console.log(state.toString())
        const p3 = new BN(10);

        // expect(state.neutralPrice().minus(p3).lt(0.01)).to.be.true;
        console.log(state.toString())
        const p4 = new BN(20);

        // expect(state.neutralPrice().minus(p4).lt(0.01)).to.be.true;
        console.log(state.toString())
        const p5 = new BN(15);

        // expect(state.neutralPrice().minus(p5).lt(0.01)).to.be.true;
        console.log(state.toString())
        const p6 = new BN(8);
        // expect(state.neutralPrice().minus(p6).lt(0.001)).to.be.true;
        console.log(state.toString())
    })
});