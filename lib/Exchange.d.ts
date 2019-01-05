import BN from 'bignumber.js';
import { State } from './State';
export declare class Exchange {
    state: State;
    name: string;
    symbol: string;
    tokenAddress: string;
    exchangeAddress: string;
    decimals: number;
    constructor(tokenAddress: any, symbol: any, exchangeAddress: any, name: any);
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
