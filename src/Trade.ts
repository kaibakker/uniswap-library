import BN from "bignumber.js";
import { State } from './State'
import { Delta } from './Delta'

export class Trade {
    delta: Delta

    // limitDelta?: Delta;

    toState?: State;
    fromState?: State;
    txHash?: string;

    constructor(eth: any = 0, tokens: any = 0, liquidity: any = 0) {
        this.delta.eth = new BN(eth);
        this.delta.tokens = new BN(tokens);
        this.delta.liquidity = new BN(liquidity);
    }

    plus(eth, tokens, liquidity): Trade {
        return new Trade(
            this.delta.eth.plus(eth),
            this.delta.tokens.plus(tokens),
            this.delta.liquidity.plus(liquidity)
        );
    }

    isEqual(trade: Trade): boolean {
        return this.delta.eth === trade.delta.eth && this.delta.tokens === trade.delta.tokens && this.delta.liquidity === trade.delta.liquidity;
    }

    toString() {
        // return `${this.delta.events()[0][0]}(${this.delta.eth.toString()}, ${this.delta.tokens.toString()}, ${this.delta.liquidity.toString()})`;
        return ""
    }

    asVector(): number[] {
        return [this.delta.eth.dividedBy(10 ** 18).toNumber(), this.delta.tokens.dividedBy(10 ** 18).toNumber(), this.delta.liquidity.dividedBy(10 ** 18).toNumber()]
    }

    events(): string[] {
        if (this.delta.liquidity.eq(0)) {
            if (this.delta.eth.gt(0)) {
                return ['EthPurchase']
            } else if (this.delta.eth.lt(0)) {
                return ['TokenPurchase']
            }
        } else if (this.delta.liquidity.gt(0)) {
            return ['AddLiquidity', 'Transfer']
        } else if (this.delta.liquidity.lt(0)) {
            return ['RemoveLiquidity', 'Transfer']
        }
    }
}
