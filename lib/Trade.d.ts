import BN from "bignumber.js";
import { State } from './State';
import { Delta } from './Delta';
export declare class Trade {
    delta: Delta;
    toState?: State;
    fromState?: State;
    txHash?: string;
    constructor(eth?: any, tokens?: any, liquidity?: any);
    plus(eth: BN, tokens: BN, liquidity?: BN): Trade;
    isEqual(trade: Trade): boolean;
    toString(): string;
    asVector(): number[];
    events(): string[];
}
