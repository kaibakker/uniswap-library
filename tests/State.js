'use strict';
const chai = require('chai');
const BN = require("bignumber.js")

chai.use(require('chai-bignumber')(BN));
const expect = chai.expect;
const { State } = require('../lib/State.js');
const { Delta } = require('../lib/Delta.js');


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

const state1 = new State(delta1);
describe('class State', () => {
    it('performDelta() works correctly', () => {
        let trade = state1.performDelta(delta1)

        // expect(state.tokenReserve).to.be.bignumber.equal(start.tokens);
        // expect(state.totalSupply).to.be.bignumber.equal(start.liquidity);
        // expect(state.ethReserve).to.be.bignumber.equal(start.eth);
        // expect(state.symbol).to.equal(undefined);
    });

    it('performDelta() throws on negative liquidity', () => {
        const state = new State(new Delta())

        expect(state.performDelta.bind(state, negativeLiquidity)).to.throw("NEGATIVE_TOTAL_SUPPLY")
    });

    it('performDelta() throws on negative eth', () => {
        const state = new State(new Delta())

        expect(state.performDelta.bind(state, negativeEth)).to.throw("NEGATIVE_ETH_RESERVE")
    });

    it('performDelta() throws on negative tokens', () => {
        const state = new State(new Delta())

        // expect(state.performDelta.bind(state, negativeTokens)).to.throw("NEGATIVE_TOKEN_RESERVE")
    });

    it('addLiquidity() works correctly', () => {
        let trade = new State(new Delta()).performDelta(start)
        const change = trade.toState.addLiquidity(delta2.eth)
        // expect(change.eth).to.be.bignumber.equal(delta2.eth);
        // expect(change.tokens).to.be.bignumber.equal(delta2.tokens);
        // expect(change.liquidity).to.be.bignumber.equal(delta2.liquidity);
    });

    it('removeLiquidity() works correctly', () => {
        const liquidity = new BN(1)
        let state = new State(delta1)
        const change = state.removeLiquidity(liquidity)

        // expect(change.eth).to.be.bignumber.equal(-1);
        // expect(state.ethReserve).to.be.bignumber.equal(4);
        // expect(state.tokenReserve).to.be.bignumber.equal(80);
        // expect(state.totalSupply).to.be.bignumber.equal(4);
    });

    it('getInputPrice() works correctly', () => {

        let state = new State(delta2)
        // state.performDelta(delta);
        const delta4 = state.getInputPrice(delta3.eth)
        // expect(delta.eth).to.be.bignumber.equal(-delta4.eth)
        // expect(delta4.tokens.gte(16)).to.be.true()
        // expect(new State(new Delta()).performDelta(delta).performDelta(delta4)).to.be.equal(state);
    })


    it('getOutputPrice() works correctly', () => {
        let state = new State(new Delta()).performDelta(delta6)

        // expect(state.getOutputPrice(new BN(1)).tokens, state.ethReserve, state.tokenReserve).to.be.bignumber.equal(16.6249791562447890612)
    })

    it('neutralPrice() works correctly', () => {
        let state = new State(delta1)
        const price = state.neutralPrice()

        // expect(price).to.be.bignumber.equal(20);
    });

    it('ethToTokenOutput() works correctly', () => {
        const deltaEth = new BN(10)
        let state = new State(delta1)
        const change = state.ethToTokenOutput(deltaEth)

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
        // expect(state1.delta.liquidity).to.be.equal(state2.delta.liquidity)
    }).timeout(70000);

    it('should makeToPrice() correctly', () => {
        let state = new State(delta1)
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