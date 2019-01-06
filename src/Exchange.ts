import * as Web3 from 'web3';

import * as EXCHANGE_ABI from './abi/exchange.json';
import * as FACTORY_ABI from './abi/factory.json';
import * as ERC20_ABI from './abi/erc20.json';

import BN from 'bignumber.js'


import { State } from './State';
import { Trade } from './Trade';

import { setAddresses } from './addresses';

const NETWORK_ID = 1;
const PROVIDER_URL = "https://mainnet.infura.io/v3/83d36df8e3eb42c9a061340696c0bf55";
const addresses = setAddresses(NETWORK_ID)

const web3 = new Web3(PROVIDER_URL);


export class Exchange {
    state: State;
    exchangeName: string;
    exchangeSymbol: string;
    tokenName: string;
    tokenSymbol: string;
    tokenAddress: string;
    exchangeAddress: string;
    decimals: number;

    constructor(tokenAddress: string = null, symbol: string = null, exchangeAddress: string = null, name: string = null) {
        this.tokenName = name;
        this.tokenSymbol = symbol;

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

    async updateExchangeSymbol(): Promise<string> {
        this.exchangeSymbol = web3.utils.hexToString(await this.exchangeContract().methods.symbol().call());
        return this.exchangeSymbol;
    }

    async updateExchangeName(): Promise<string> {
        this.exchangeName = web3.utils.hexToString(await this.exchangeContract().methods.name().call());
        return this.exchangeName;
    }

    async updateTokenSymbol(): Promise<string> {
        this.tokenSymbol = web3.utils.hexToString(await this.tokenContract().methods.symbol().call());
        return this.tokenSymbol;
    }

    async updateTokenName(): Promise<string> {
        this.tokenName = web3.utils.hexToString(await this.tokenContract().methods.name().call());
        return this.tokenName;
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
        this.state = new State(eth, tokens, liquidity)


        return this.state;
    }

    async getStateFromLogs(): Promise<State> {
        let options = {
            fromBlock: 6627944,
            toBlock: 'latest'
        };

        const events = await this.exchangeContract().getPastEvents("allEvents", options)

        return events.reduce((state, event) => {
            console.log(event)
            return state.addEvent(event).toState;
        }, new State())
    }

    toString(): string {
        return `${this.tokenSymbol}(${this.ethReserve.toString()}, ${this.tokenReserve.toString()}, ${this.totalSupply.toString()})`;
    }
}