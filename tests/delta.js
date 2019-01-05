'use strict';
const chai = require('chai');
const BN = require("bignumber.js")

chai.use(require('chai-bignumber')(BN));
const expect = chai.expect;
const { Exchange } = require('../lib/Exchange.js');

const fixtures = {
    deltas: {
        start: { eth: new BN(5), tokens: new BN(100), liquidity: new BN(1) },
        negativeLiquidity: { eth: new BN(5), tokens: new BN(100), liquidity: new BN(-1) },
        negativeEth: { eth: new BN(-5), tokens: new BN(100), liquidity: new BN(1) },
        negativeTokens: { eth: new BN(5), tokens: new BN(-100), liquidity: new BN(1) }
    }
}


const deltaToString = function (delta) {
    return `delta(${delta.eth.toString()}, ${delta.tokens.toString()}, ${delta.liquidity.toString()})`;
}


describe('class Exchange (delta calculations)', () => {
    it('performDelta() works correctly', () => {
        let exchange = new Exchange({}).performDelta(fixtures.deltas.start)

        expect(exchange.tokenReserve).to.be.bignumber.equal(fixtures.deltas.start.tokens);
        expect(exchange.totalSupply).to.be.bignumber.equal(fixtures.deltas.start.liquidity);
        expect(exchange.ethReserve).to.be.bignumber.equal(fixtures.deltas.start.eth);
        expect(exchange.symbol).to.equal(undefined);
    });

    it('performDelta() throws on negative liquidity', () => {
        const exchange = new Exchange({})

        expect(exchange.performDelta.bind(exchange, fixtures.deltas.negativeLiquidity)).to.throw("NEGATIVE_TOTAL_SUPPLY")
    });

    it('performDelta() throws on negative eth', () => {
        const exchange = new Exchange({})

        expect(exchange.performDelta.bind(exchange, fixtures.deltas.negativeEth)).to.throw("NEGATIVE_ETH_RESERVE")
    });

    it('performDelta() throws on negative tokens', () => {
        const exchange = new Exchange({})

        expect(exchange.performDelta.bind(exchange, fixtures.deltas.negativeTokens)).to.throw("NEGATIVE_TOKEN_RESERVE")
    });

    it('addLiquidity() works correctly', () => {
        let exchange = new Exchange({}).performDelta(fixtures.deltas.start)
        const expectedDelta = { eth: new BN(10), tokens: new BN(201), liquidity: new BN(2) }
        const change = exchange.addLiquidity(expectedDelta.eth)
        expect(change.eth).to.be.bignumber.equal(expectedDelta.eth);
        expect(change.tokens).to.be.bignumber.equal(expectedDelta.tokens);
        expect(change.liquidity).to.be.bignumber.equal(expectedDelta.liquidity);
    });

    it('removeLiquidity() works correctly', () => {
        const liquidity = new BN(1)
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const change = exchange.removeLiquidity(liquidity)

        expect(change.eth).to.be.bignumber.equal(-1);
        expect(exchange.ethReserve).to.be.bignumber.equal(4);
        expect(exchange.tokenReserve).to.be.bignumber.equal(80);
        expect(exchange.totalSupply).to.be.bignumber.equal(4);
    });

    xit('getInputPrice() works correctly', () => {
        const delta = { eth: new BN(1), tokens: new BN(16.6249791562447890612), liquidity: new BN(0) };

        let exchange = new Exchange({}).performDelta(fixtures.deltas.start)
        // exchange.performDelta(delta);
        const newDelta = exchange.getInputPrice(delta.eth, exchange.ethReserve, exchange.tokenReserve)
        console.log(deltaToString(newDelta))
        expect(delta.eth).to.be.bignumber.equal(-newDelta.eth)
        expect(newDelta.tokens.gte(16)).to.be.true()
        // expect(new Exchange({}).performDelta(delta).performDelta(newDelta)).to.be.equal(exchange);
    })


    xit('getOutputPrice() works correctly', () => {
        let exchange = new Exchange({}).performDelta(fixtures.deltas.start)

        expect(exchange.getOutputPrice(new BN(1)).tokens, exchange.ethReserve, exchange.tokenReserve).to.be.bignumber.equal(16.6249791562447890612)
    })

    it('neutralPrice() works correctly', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const price = exchange.neutralPrice()

        expect(price).to.be.bignumber.equal(20);
    });

    it('ethToTokenOutput() works correctly', () => {
        const deltaEth = new BN(10)
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const change = exchange.ethToTokenOutput(deltaEth)

        expect(change.eth).to.be.bignumber.equal(deltaEth);
        expect(change.liquidity).to.be.bignumber.equal(0);
        // expect(exchange.ethReserve).to.be.bignumber.equal(4);
        // expect(exchange.tokenReserve).to.be.bignumber.equal(80);
        // expect(exchange.totalSupply).to.be.bignumber.equal(4);
    });

    it('double sync check', async () => {
        let exchange1 = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        let exchange2 = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        await exchange1.updateEthReserve();
        await exchange1.updateTokenReserve();
        await exchange1.updateTotalSupply();
        exchange2.syncBalancesWithLogs((exchange) => {
            console.log(exchange1.toString())
            console.log(exchange.toString())
        });
    }).timeout(70000);

    xit('should makeToPrice() correctly', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const p1 = new BN(10);
        console.log(deltaToString(exchange.makeToPrice(p1)));
        // expect(.lt(0.01)).to.be.true;
        console.log(exchange.toString())
        const p2 = new BN(20);
        console.log(deltaToString(exchange.makeToPrice(p2)));
        // expect(exchange.neutralPrice().minus(p2).lt(0.01)).to.be.true;
        console.log(exchange.toString())
        const p3 = new BN(10);
        console.log(deltaToString(exchange.makeToPrice(p3)));
        // expect(exchange.neutralPrice().minus(p3).lt(0.01)).to.be.true;
        console.log(exchange.toString())
        const p4 = new BN(20);
        console.log(deltaToString(exchange.makeToPrice(p4)));
        // expect(exchange.neutralPrice().minus(p4).lt(0.01)).to.be.true;
        console.log(exchange.toString())
        const p5 = new BN(15);
        console.log(deltaToString(exchange.makeToPrice(p5)));
        // expect(exchange.neutralPrice().minus(p5).lt(0.01)).to.be.true;
        console.log(exchange.toString())
        const p6 = new BN(8);
        console.log(deltaToString(exchange.makeToPrice(p6)));
        // expect(exchange.neutralPrice().minus(p6).lt(0.001)).to.be.true;
        console.log(exchange.toString())
    })
});