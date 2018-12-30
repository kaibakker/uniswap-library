'use strict';
const chai = require('chai');
const BN = require("bignumber.js")

chai.use(require('chai-bignumber')(BN));
const expect = chai.expect;
const { Exchange } = require('../lib/Exchange.js');

describe('class Exchange', () => {
    it('initialize correctly  with values', () => {
        let exchange = new Exchange({ ethReserve: 5, tokenReserve: 100, totalSupply: 1 })

        // expect(exchange.ethReserve).to.be.bignumber.equal(new BN(5));
        // expect(exchange.tokenReserve).to.be.bignumber.equal(new BN(100));
        // expect(exchange.tokenSupply).to.be.bignumber.equal(new BN(1));
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






    // console.log(exchange2);

    // console.log(exchange3);



    // const trade5 = exchange.addLiquidity(100);

    // const ethValue = 1
    // const price = exchange.neutralPrice();
    // const tokenValue = (exchange.getInputPrice(ethValue))
    // console.log(ethValue / tokenValue * price - 1)


    // exchange.getInputPrice(10)
    // exchange.removeLiquidity(10)
    // exchange.removeLiquidity(10)
    // exchange.getInputPrice(10)
    // exchange.removeLiquidity(10)
    // exchange.getInputPrice(10)
    // exchange.removeLiquidity(10)
    // exchange.getInputPrice(10)
    // exchange.removeLiquidity(10)
    // exchange.getInputPrice(10)
    // exchange.removeLiquidity(10)

    // exchange.ethToTokenOutput(10)
    // exchange.ethToTokenInput(10)
    // exchange.removeLiquidity(10)
    // exchange.removeLiquidity(10)

    // exchange.removeLiquidity(10)

    // exchange.getInputPrice(10)
    // // console.log(exchange)
    // // console.log(trade5)
});