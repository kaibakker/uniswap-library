import { State } from './State';
import { Delta } from './Delta';
export declare class Trade {
    delta: Delta;
    toState?: State;
    fromState?: State;
    txHash?: string;
    constructor(eth?: any, tokens?: any, liquidity?: any);
    plus(eth: any, tokens: any, liquidity: any): Trade;
    isEqual(trade: Trade): boolean;
    toString(): string;
    events(): string[];
}
