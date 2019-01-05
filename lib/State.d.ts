import BN from 'bignumber.js';
import { Trade } from './Trade';
import { Delta } from './Delta';
export declare class State {
    delta: Delta;
    nextTx?: Trade;
    prevTx?: Trade;
    constructor(delta: Delta);
    createTxFromEvent(event: any): Trade;
    performDelta(delta: Delta): Trade;
    tokenReserve(): BN;
    totalSupply(): BN;
    toString(): string;
    valid(): void;
    addLiquidity(eth?: BN, min_liquidity?: BN, max_tokens?: BN): Trade;
    removeLiquidity(amount?: BN, min_eth?: BN, min_tokens?: BN): Trade;
    getInputPrice(input_amount: any): Trade;
    getOutputPrice(output_amount: any): Trade;
    ethToTokenInput(eth_sold?: BN, min_tokens?: BN): Trade;
    ethToTokenOutput(tokens_bought?: BN, max_eth?: BN): Trade;
    tokenToEthOutput(eth_bought?: BN, max_tokens?: BN): Trade;
    neutralPrice(): BN;
    reserve(): BN;
    makeToPrice(price: any, max_liquidity: any): Trade;
}
