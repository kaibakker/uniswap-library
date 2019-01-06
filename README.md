# Uniswap.js Library

## User stories

- Get information about current exchange state
- Make manipulations
- 
- 

## Example Usage

```javascript
const exchange1 = new Exchange('0x23514251252152152')
const exchange2 = new Exchange(null, 'MKR')

const state1 = await exchange2.getState()

const trade1 = state1.tradeToPrice(1241);
const trade2 = trade1.state.addLiquidity(100, 10, 1000);
const trade2 = trade1.state.ethToToken(100, 10);
const trade2 = trade1.state.tokenToEthOutput(100, 10);
const trade2 = trade1.state.ethToToken(100, 10);
const trade2 = trade1.state.tradeToPrice(12132);

const trade1 = state2.ethToToken(1);
const trade1 = state2.ethToToken(1);

const trade1 = state2.sell({ eth: 10 });

await trade1.submitTx();

const trade2 = trade1.state.tokenToEthOutput(10);

await trade1.submitTx();

const trade3 = {delta, toState, fromState} as Trade;

state1.performTrade(trade1).state.performTrade(trade2).state.performTrade(trade3)

state1.ethToToken(1).submitTx()
```

```javascript
Exchange.toState()
Exchange.fromState()
Exchange.transaction()
Exchange.events()
```

```javascript
State.tokenToEthOutput()
State.ethToToken()
State.performTrade()
State.trade()
State.performEvent()
State.submitTx()
State.neutralPrice()
State.moveToPrice()
State.tokenToEthOutput()
```

```javascript
Trade.toState()
Trade.fromState()
Trade.transaction()
Trade.events()
```