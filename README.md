# Uniswap.js Library

## Example Usage

```javascript
const exchange1 = new Exchange('0x23514251252152152')
const exchange2 = new Exchange(null, 'MKR')

const trade1 = state2.ethToToken(1);
const trade1 = state2.ethToToken(1);

const trade1 = state2.sell({ eth: 10 });

await trade1.submitTx();

const trade2 = trade1.state.tokenToEth(10);

await trade1.submitTx();

const trade3 = new Trade(toState, fromState , delta)

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
State.tokenToEth()
State.ethToToken()
State.performTrade()
State.performDelta()
State.performEvent()
State.submitTx()
State.neutralPrice()
State.moveToPrice()
State.tokenToEth()
```

```javascript
Trade.toState()
Trade.fromState()
Trade.transaction()
Trade.events()
```