import * as Web3 from 'web3';

import * as EXCHANGE_ABI from './abi/exchange.json';
import * as FACTORY_ABI from './abi/factory.json';
import * as ERC20_ABI from './abi/erc20.json';

import BN from 'bignumber.js'


import { State } from './State';
import { Delta } from './Delta';

import { setAddresses } from './addresses';

const NETWORK_ID = 1;
const PROVIDER_URL = "https://mainnet.infura.io/v3/83d36df8e3eb42c9a061340696c0bf55";
const addresses = setAddresses(NETWORK_ID)

const web3 = new Web3(PROVIDER_URL);


export class Exchange {
    state: State;
    name: string;
    symbol: string;
    tokenAddress: string;
    exchangeAddress: string;
    decimals: number;

    constructor(tokenAddress: string = null, symbol: string = null, exchangeAddress: string = null, name: string = null) {
        this.name = name;
        this.symbol = symbol;
        this.tokenAddress = tokenAddress;
        this.exchangeAddress = exchangeAddress;
        this.decimals = 18;

        if (symbol) {
            this.exchangeAddress = addresses.payload.exchangeAddresses.addresses.filter((x) => { return x[0] === symbol })[0][1];
            this.tokenAddress = addresses.payload.tokenAddresses.addresses.filter((x) => { return x[0] === symbol })[0][1];
        } else if (tokenAddress) {
            this.exchangeAddress = addresses.payload.exchangeAddresses.fromToken[tokenAddress];
            this.tokenAddress = tokenAddress;
        }
    }

    exchangeContract(): any {
        return new web3.eth.Contract(EXCHANGE_ABI, this.exchangeAddress);
    }

    tokenContract(): any {
        return new web3.eth.Contract(ERC20_ABI, this.tokenAddress);
    }

    exchangeTokenContract(): any {
        return new web3.eth.Contract(ERC20_ABI, this.exchangeAddress);
    }

    factoryContract(): any {
        return new web3.eth.Contract(FACTORY_ABI, addresses.payload.factoryAddress);
    }

    async totalSupply(): Promise<BN> {
        return new BN(await this.exchangeTokenContract().methods.totalSupply().call());
    }

    async tokenReserve(): Promise<BN> {
        return new BN(await this.tokenContract().methods.balanceOf(this.exchangeAddress).call());
    }

    async ethReserve(): Promise<BN> {
        return new BN(await web3.eth.getBalance(this.exchangeAddress));
    }

    async updateSymbol(): Promise<string> {
        this.symbol = web3.utils.hexToString(await this.exchangeContract().methods.symbol().call());
        return this.symbol;
    }

    async updateName(): Promise<string> {
        this.name = web3.utils.hexToString(await this.exchangeContract().methods.name().call());
        return this.name;
    }

    async updateDecimals(): Promise<number> {
        this.decimals = parseInt(await this.exchangeContract().methods.decimals().call());
        return this.decimals;
    }

    async updateTokenAddress(): Promise<string> {
        this.tokenAddress = await this.exchangeContract().methods.tokenAddress().call();
        return this.tokenAddress;
    }

    async getState(): Promise<State> {
        const eth = await this.ethReserve()
        const tokens = await this.tokenReserve()
        const liquidity = await this.totalSupply()
        const delta = new Delta(eth, tokens, liquidity)
        const state = new State(delta)
        this.state = state;
        return state;
    }

    async getStateFromLogs(): Promise<State> {
        let options = {
            fromBlock: 6627944,
            toBlock: 'latest'
        };

        const events = this.exchangeContract().getPastEvents("allEvents", options)

        return events.reduce((state, event) => {
            return state.createTxFromEvent(event).toState;
        }, this)
    }

    toString(): string {
        return `${this.symbol}(${this.ethReserve.toString()}, ${this.tokenReserve.toString()}, ${this.totalSupply.toString()})`;
    }
}