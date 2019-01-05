import BN from "bignumber.js";

export class Delta {
    eth: BN;
    tokens: BN;
    liquidity: BN;

    constructor(eth: any = 0, tokens: any = 0, liquidity: any = 0) {
        this.eth = new BN(eth);
        this.tokens = new BN(tokens);
        this.liquidity = new BN(liquidity);
    }

    plus(delta: Delta): Delta {
        return new Delta(
            this.eth.plus(delta.eth),
            this.tokens.plus(delta.tokens),
            this.liquidity.plus(delta.liquidity)
        );
    }

    isEqual(delta: Delta): boolean {
        return this.eth === delta.eth && this.tokens === delta.tokens && this.liquidity === delta.liquidity;
    }

    toString() {
        return `Delta(${this.eth.toString()}, ${this.tokens.toString()}, ${this.liquidity.toString()})`;
    }
}
