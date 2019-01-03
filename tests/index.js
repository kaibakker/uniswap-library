'use strict';
const chai = require('chai');
const BN = require("bignumber.js")

chai.use(require('chai-bignumber')(BN));
const expect = chai.expect;
const { Exchange } = require('../lib/Exchange.js');

const start = { eth: new BN(5), tokens: new BN(100), liquidity: new BN(1) };
const negativeLiquidity = { eth: new BN(5), tokens: new BN(100), liquidity: new BN(-1) };
describe('class Exchange', () => {
    it('performDelta() works correctly', () => {
        let exchange = new Exchange({}).performDelta(start)

        expect(exchange.tokenReserve).to.be.bignumber.equal(start.tokens);
        expect(exchange.totalSupply).to.be.bignumber.equal(start.liquidity);
        expect(exchange.ethReserve).to.be.bignumber.equal(start.eth);
        expect(exchange.symbol).to.equal(undefined);
    });

    xit('performDelta() throws on negative liquidity', () => {
        expect((new Exchange({})).performDelta(negativeLiquidity)).to.throw('NEGATIVE_TOTAL_SUPPLY')

    });

    it('initializes correctly with tokenAddress', () => {
        let exchange = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })

        expect(exchange.exchangeAddress).to.equal('0x2C4Bd064b998838076fa341A83d007FC2FA50957');
        expect(exchange.tokenAddress).to.equal('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2');
    });

    it('initializes correctly with exchangeAddress', () => {
        let exchange = new Exchange({ exchangeAddress: '0x2C4Bd064b998838076fa341A83d007FC2FA50957' })

        expect(exchange.exchangeAddress).to.equal('0x2C4Bd064b998838076fa341A83d007FC2FA50957');
    });

    it('initializes correctly with symbol', () => {
        let exchange = new Exchange({ symbol: 'MKR' })

        expect(exchange.symbol).to.equal('MKR');
        expect(exchange.exchangeAddress).to.equal('0x2C4Bd064b998838076fa341A83d007FC2FA50957');
        expect(exchange.tokenAddress).to.equal('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2');
    });


    it('updates totalSupply correctly', async () => {
        let exchange = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        await exchange.updateTotalSupply();

        expect(exchange.totalSupply).to.be.bignumber;
    });

    it('updates ethReserve correctly', async () => {
        let exchange = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        await exchange.updateEthReserve();

        expect(exchange.totalSupply).to.be.bignumber;
    });

    it('updates tokenReserve correctly', async () => {
        let exchange = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        await exchange.updateTokenReserve();

        expect(exchange.tokenReserve).to.be.bignumber;
    });

    it('updates symbol correctly', async () => {
        let exchange = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        await exchange.updateSymbol();

        expect(exchange.symbol).to.equal('UNI-V1');
    });

    it('updates name correctly', async () => {
        let exchange = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        await exchange.updateName();

        expect(exchange.name).to.equal('Uniswap V1');
    });

    it('updates decimals correctly', async () => {
        let exchange = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        await exchange.updateDecimals();

        expect(exchange.decimals).to.equal(18);
    });

    it('updates tokenAddress correctly', async () => {
        let exchange = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        await exchange.updateTokenAddress();

        expect(exchange.tokenAddress).to.equal('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2');
    });

    xit('addLiquidity() works correctly', () => {
        let exchange = new Exchange({ delta: start })
        const delta = { eth: new BN(10), liquidity: new BN(2), tokens: new BN(201) }
        const change = exchange.addLiquidity(new BN(10))

        // expect(change).to.be.equal(delta);
        // expect(exchange.ethReserve).to.be.bignumber.equal(start.ethReserve.plus(change.eth));
        expect(exchange.tokenReserve).to.be.bignumber.equal(301);
        expect(exchange.totalSupply).to.be.bignumber.equal(start.liquidity.plus(change.liquidity));
    });

    it('removeLiquidity() works correctly', () => {
        const liquidity = new BN(1)
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const change = exchange.removeLiquidity(liquidity)

        // delta.plus(delta).equals(delta)

        // expect(change.liquidity).to.be.bignumber.equal(liquidity);
        expect(change.eth).to.be.bignumber.equal(-1);
        expect(exchange.ethReserve).to.be.bignumber.equal(4);
        expect(exchange.tokenReserve).to.be.bignumber.equal(80);
        expect(exchange.totalSupply).to.be.bignumber.equal(4);
    });

    xit('getInputPrice() works correctly', () => {
        const delta = { eth: new BN(1), liquidity: new BN(10), tokens: new BN(10) };

        let exchange = new Exchange({})
        exchange.performDelta(delta);
        const newDelta = exchange.getInputPrice(delta.eth)

        expect(new Exchange({}).performDelta(delta).performDelta(newDelta)).to.be.equal(exchange);
    })


    it('getOutputPrice() works correctly', () => {
        let exchange = new Exchange({ delta: start })

        // expect(exchange.getOutputPrice(new BN(1))).to.be.bignumber.equal(16.6249791562447890612)
    })

    it('neutralPrice() works correctly', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const price = exchange.neutralPrice()

        expect(price).to.be.bignumber.equal(20);
    });

    xit('ethToTokenOutput() works correctly', () => {
        const deltaEth = new BN(10)
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const change = exchange.ethToTokenOutput(deltaEth)

        expect(change.eth).to.be.bignumber.equal(deltaEth);
        expect(change.liquidity).to.be.bignumber.equal(0);
        // expect(exchange.ethReserve).to.be.bignumber.equal(4);
        // expect(exchange.tokenReserve).to.be.bignumber.equal(80);
        // expect(exchange.totalSupply).to.be.bignumber.equal(4);
    });

    xit('double sync check', async (done) => {
        let exchange1 = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        let exchange2 = new Exchange({ tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' })
        await exchange1.updateEthReserve();
        await exchange1.updateTokenReserve();
        await exchange1.updateTotalSupply();
        console.log(exchange1.totalSupply)
        exchange2.syncBalancesWithLogs();

        // expect(exchange1.ethReserve).to.be.bignumber.equal(exchange2.ethReserve)
        // expect(exchange1.tokenReserve).to.be.bignumber.equal(exchange2.tokenReserve)

        // expect(change).to.be.bignumber.equal(12.03309929789368104313);
        // expect(exchange.ethReserve).to.be.bignumber.equal(4);
        // expect(exchange.tokenReserve).to.be.bignumber.equal(80);
        // expect(exchange.totalSupply).to.be.bignumber.equal(4);
    }).timeout(70000);

    xit('should makeToPrice() correctly', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const p1 = new BN(10);
        console.log(exchange.makeToPrice(p1));
        // expect(.lt(0.01)).to.be.true;
        console.log(exchange.ethReserve.toString(), exchange.tokenReserve.toString(), exchange.neutralPrice().minus(p1).toString())
        const p2 = new BN(20);
        console.log(exchange.makeToPrice(p2));
        // expect(exchange.neutralPrice().minus(p2).lt(0.01)).to.be.true;
        console.log(exchange.ethReserve.toString(), exchange.tokenReserve.toString(), exchange.neutralPrice().minus(p1).toString())
        const p3 = new BN(10);
        console.log(exchange.makeToPrice(p3));
        // expect(exchange.neutralPrice().minus(p3).lt(0.01)).to.be.true;
        console.log(exchange.ethReserve.toString(), exchange.tokenReserve.toString(), exchange.neutralPrice().minus(p1).toString())
        const p4 = new BN(20);
        console.log(exchange.makeToPrice(p4));
        // expect(exchange.neutralPrice().minus(p4).lt(0.01)).to.be.true;
        console.log(exchange.ethReserve.toString(), exchange.tokenReserve.toString(), exchange.neutralPrice().minus(p1).toString())
        const p5 = new BN(15);
        console.log(exchange.makeToPrice(p5));
        // expect(exchange.neutralPrice().minus(p5).lt(0.01)).to.be.true;
        console.log(exchange.ethReserve.toString(), exchange.tokenReserve.toString(), exchange.neutralPrice().minus(p1).toString())
        const p6 = new BN(8);
        console.log(exchange.makeToPrice(p6));
        // expect(exchange.neutralPrice().minus(p6).lt(0.001)).to.be.true;
        console.log(exchange.ethReserve.toString(), exchange.tokenReserve.toString())
    })
});