'use strict';
const chai = require('chai');
const BN = require("bignumber.js")

chai.use(require('chai-bignumber')(BN));
const expect = chai.expect;
const { Exchange } = require('../lib/Exchange.js');

describe('class Exchange', () => {
    it('initialize correctly  with values', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 1 })

        expect(exchange.ethReserve).to.be.bignumber.equal(5);
        // expect(exchange.tokenReserve).to.be.bignumber;
        // expect(exchange.tokenSupply).to.be.bignumber;
        expect(exchange.symbol).to.equal(undefined);
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

    it('getInputPrice() works correctly', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 1 })

        // expect(exchange.getInputPrice(new BN(1))).to.be.bignumber.equal(16.6249791562447890612)
    })

    it('addLiquidity() works correctly', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 1 })
        const change = exchange.addLiquidity(new BN(10))

        expect(change).to.be.bignumber.equal(2);
        expect(exchange.ethReserve).to.be.bignumber.equal(15);
        expect(exchange.tokenReserve).to.be.bignumber.equal(301);
        expect(exchange.totalSupply).to.be.bignumber.equal(3);
    });

    it('removeLiquidity() works correctly', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const change = exchange.removeLiquidity(new BN(1))

        expect(change).to.be.bignumber.equal(20);
        expect(exchange.ethReserve).to.be.bignumber.equal(4);
        expect(exchange.tokenReserve).to.be.bignumber.equal(80);
        expect(exchange.totalSupply).to.be.bignumber.equal(4);
    });

    it('neutralPrice() works correctly', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const price = exchange.neutralPrice()

        expect(price).to.be.bignumber.equal(20);
    });

    it('ethToTokenOutput() works correctly', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 5 })
        const change = exchange.ethToTokenOutput(new BN(10))

        // expect(change).to.be.bignumber.equal(12.03309929789368104313);
        // expect(exchange.ethReserve).to.be.bignumber.equal(4);
        // expect(exchange.tokenReserve).to.be.bignumber.equal(80);
        // expect(exchange.totalSupply).to.be.bignumber.equal(4);
    });

});