'use strict';
const chai = require('chai');
const BN = require("bignumber.js")

chai.use(require('chai-bignumber')(BN));
const expect = chai.expect;

const { Delta } = require('../lib/Delta.js');


const delta1 = new Delta(new BN(10), new BN(1000), new BN(1))
const delta2 = new Delta(new BN(1), new BN(1), new BN(1))
const delta3 = new Delta(new BN(11), new BN(1001), new BN(2))

describe('class Delta()', () => {
    it('can be compared and return true', () => {
        expect(delta1.isEqual(delta1)).to.be.true;
    });

    it('can be compared and return false', () => {
        expect(delta1.isEqual(delta2)).to.be.false;
    });

    it('values works correctly', () => {
        expect(delta1.eth).to.be.bignumber.equal(10);
        expect(delta1.tokens).to.be.bignumber.equal(1000);
        expect(delta1.liquidity).to.be.bignumber.equal(1);
    });

    it('plus() works correctly', () => {
        const delta4 = delta1.plus(delta2)
        expect(delta3.toString()).to.be.equal(delta4.toString())
        // TODO: expect(delta3.isEqual(delta4)).to.be.true();
    });
    it('toString() works correctly', () => {
        expect(delta1.toString()).to.be.equal("Delta(10, 1000, 1)");
    });
})