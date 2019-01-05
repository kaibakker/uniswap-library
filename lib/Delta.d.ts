import BN from "bignumber.js";
export declare class Delta {
    eth: BN;
    tokens: BN;
    liquidity: BN;
    constructor(eth?: any, tokens?: any, liquidity?: any);
    plus(delta: Delta): Delta;
    isEqual(delta: Delta): boolean;
    toString(): string;
}
