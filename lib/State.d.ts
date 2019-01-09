import BN from 'bignumber.js';
import { Trade } from './Trade';
export declare class State {
    eth: BN;
    tokens: BN;
    liquidity: BN;
    constructor(eth?: any, tokens?: any, liquidity?: any);
    neutralPrice(): BN;
    reserve(): BN;
    valid(): void;
    toString(): string;
    trade(eth: BN, tokens: BN, liquidity?: BN): Trade;
    tradeToPrice(price: BN, max_liquidity?: BN): Trade;
    addEvent(event: any): Trade;
    addLiquidity(eth: BN, min_liquidity?: BN, max_tokens?: BN): Trade;
    active(): boolean;
    removeLiquidity(liquidity: BN, min_eth?: BN, min_tokens?: BN): Trade;
    getInputPrice(input_amount: BN, input_reserve: BN, output_reserve: BN): Trade;
    getOutputPrice(output_amount: BN, input_reserve: BN, output_reserve: BN): Trade;
    ethToTokenInput(eth_sold: BN, min_tokens?: BN): Trade;
    tokenToEthInput(tokens_sold: BN, min_eth?: BN): Trade;
    ethToTokenOutput(tokens_bought: BN, max_eth?: BN): Trade;
    tokenToEthOutput(eth_bought: BN, max_tokens?: BN): Trade;
}
