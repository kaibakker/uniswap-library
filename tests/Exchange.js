'use strict';
const chai = require('chai');
const BN = require("bignumber.js")

chai.use(require('chai-bignumber')(BN));
const expect = chai.expect;

const { Exchange } = require('../lib/Exchange.js');

describe('class Exchange()', () => {

    it('initializes correctly with tokenAddress', () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')

        expect(exchange.exchangeAddress).to.equal('0x2C4Bd064b998838076fa341A83d007FC2FA50957');
        expect(exchange.tokenAddress).to.equal('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2');
    });

    it('initializes correctly with exchangeAddress', () => {
        let exchange = new Exchange(null, null, '0x2C4Bd064b998838076fa341A83d007FC2FA50957')

        expect(exchange.exchangeAddress).to.equal('0x2C4Bd064b998838076fa341A83d007FC2FA50957');
    });

    it('initializes correctly with symbol', () => {
        let exchange = new Exchange(null, 'MKR');

        expect(exchange.symbol).to.equal('MKR');
        expect(exchange.exchangeAddress).to.equal('0x2C4Bd064b998838076fa341A83d007FC2FA50957');
        expect(exchange.tokenAddress).to.equal('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2');
    });


    it('updates totalSupply correctly', async () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')


        expect(await exchange.totalSupply()).to.be.bignumber;
    });

    it('updates ethReserve correctly', async () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')

        expect(await exchange.ethReserve()).to.be.bignumber;
    });

    it('updates tokenReserve correctly', async () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')

        expect(await exchange.tokenReserve()).to.be.bignumber;
    });

    it('updates tokenSymbol correctly', async () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')
        await exchange.updateTokenSymbol();

        expect(exchange.tokenSymbol).to.equal('Maker');
    });

    it('updates tokenName correctly', async () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')
        await exchange.updateTokenName();

        expect(exchange.tokenName).to.equal('MKR');
    });

    it('updates exchangeSymbol correctly', async () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')
        await exchange.updateExchangeSymbol();

        expect(exchange.exchangeSymbol).to.equal('UNI-V1');
    });

    it('updates exchangeName correctly', async () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')
        await exchange.updateExchangeName();

        expect(exchange.exchangeName).to.equal('Uniswap V1');
    });

    it('updates decimals correctly', async () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')
        await exchange.updateDecimals();

        expect(exchange.decimals).to.equal(18);
    });

    it('updates tokenAddress correctly', async () => {
        let exchange = new Exchange('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2')
        await exchange.updateTokenAddress();

        expect(exchange.tokenAddress).to.equal('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2');
    });
})