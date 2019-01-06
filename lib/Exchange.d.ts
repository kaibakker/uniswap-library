import BN from 'bignumber.js';
import { State } from './State';
export declare class Exchange {
    state: State;
    exchangeName: string;
    exchangeSymbol: string;
    tokenName: string;
    tokenSymbol: string;
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
    updateExchangeSymbol(): Promise<string>;
    updateExchangeName(): Promise<string>;
    updateTokenSymbol(): Promise<string>;
    updateTokenName(): Promise<string>;
    updateDecimals(): Promise<number>;
    updateTokenAddress(): Promise<string>;
    getState(): Promise<State>;
    getStateFromLogs(): Promise<State>;
    toString(): string;
}
