import BN from 'bignumber.js';
import { State } from './State';
export declare class Exchange {
    state: State;
    name: string;
    symbol: string;
    tokenAddress: string;
    exchangeAddress: string;
    decimals: number;
    constructor(tokenAddress?: string, symbol?: string, exchangeAddress?: string, name?: string);
    exchangeContract(): any;
    tokenContract(): any;
    exchangeTokenContract(): any;
    factoryContract(): any;
    totalSupply(): Promise<BN>;
    tokenReserve(): Promise<BN>;
    ethReserve(): Promise<BN>;
    updateSymbol(): Promise<string>;
    updateName(): Promise<string>;
    updateDecimals(): Promise<number>;
    updateTokenAddress(): Promise<string>;
    getState(): Promise<State>;
    getStateFromLogs(): Promise<State>;
    toString(): string;
}
