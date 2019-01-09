"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Web3 = require("web3");
var EXCHANGE_ABI = require("./abi/exchange.json");
var FACTORY_ABI = require("./abi/factory.json");
var ERC20_ABI = require("./abi/erc20.json");
var bignumber_js_1 = require("bignumber.js");
var State_1 = require("./State");
var addresses_1 = require("./addresses");
var NETWORK_ID = 1;
var PROVIDER_URL = "https://mainnet.infura.io/v3/83d36df8e3eb42c9a061340696c0bf55";
var addresses = addresses_1.setAddresses(NETWORK_ID);
var web3 = new Web3(PROVIDER_URL);
var Exchange = /** @class */ (function () {
    function Exchange(tokenAddress, symbol, exchangeAddress, name) {
        if (tokenAddress === void 0) { tokenAddress = null; }
        if (symbol === void 0) { symbol = null; }
        if (exchangeAddress === void 0) { exchangeAddress = null; }
        if (name === void 0) { name = null; }
        this.tokenName = name;
        this.tokenSymbol = symbol;
        this.tokenAddress = tokenAddress;
        this.exchangeAddress = exchangeAddress;
        this.decimals = 18;
        if (symbol) {
            this.exchangeAddress = addresses.payload.exchangeAddresses.addresses.filter(function (x) { return x[0] === symbol; })[0][1];
            this.tokenAddress = addresses.payload.tokenAddresses.addresses.filter(function (x) { return x[0] === symbol; })[0][1];
        }
        else if (tokenAddress) {
            this.exchangeAddress = addresses.payload.exchangeAddresses.fromToken[tokenAddress];
            this.tokenAddress = tokenAddress;
        }
    }
    Exchange.prototype.exchangeContract = function () {
        return new web3.eth.Contract(EXCHANGE_ABI, this.exchangeAddress);
    };
    Exchange.prototype.tokenContract = function () {
        return new web3.eth.Contract(ERC20_ABI, this.tokenAddress);
    };
    Exchange.prototype.exchangeTokenContract = function () {
        return new web3.eth.Contract(ERC20_ABI, this.exchangeAddress);
    };
    Exchange.prototype.factoryContract = function () {
        return new web3.eth.Contract(FACTORY_ABI, addresses.payload.factoryAddress);
    };
    Exchange.prototype.totalSupply = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = bignumber_js_1.default.bind;
                        return [4 /*yield*/, this.exchangeTokenContract().methods.totalSupply().call()];
                    case 1: return [2 /*return*/, new (_a.apply(bignumber_js_1.default, [void 0, _b.sent()]))()];
                }
            });
        });
    };
    Exchange.prototype.tokenReserve = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = bignumber_js_1.default.bind;
                        return [4 /*yield*/, this.tokenContract().methods.balanceOf(this.exchangeAddress).call()];
                    case 1: return [2 /*return*/, new (_a.apply(bignumber_js_1.default, [void 0, _b.sent()]))()];
                }
            });
        });
    };
    Exchange.prototype.ethReserve = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = bignumber_js_1.default.bind;
                        return [4 /*yield*/, web3.eth.getBalance(this.exchangeAddress)];
                    case 1: return [2 /*return*/, new (_a.apply(bignumber_js_1.default, [void 0, _b.sent()]))()];
                }
            });
        });
    };
    Exchange.prototype.updateExchangeSymbol = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this;
                        _c = (_b = web3.utils).hexToString;
                        return [4 /*yield*/, this.exchangeContract().methods.symbol().call()];
                    case 1:
                        _a.exchangeSymbol = _c.apply(_b, [_d.sent()]);
                        return [2 /*return*/, this.exchangeSymbol];
                }
            });
        });
    };
    Exchange.prototype.updateExchangeName = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this;
                        _c = (_b = web3.utils).hexToString;
                        return [4 /*yield*/, this.exchangeContract().methods.name().call()];
                    case 1:
                        _a.exchangeName = _c.apply(_b, [_d.sent()]);
                        return [2 /*return*/, this.exchangeName];
                }
            });
        });
    };
    Exchange.prototype.updateTokenSymbol = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this;
                        _c = (_b = web3.utils).hexToString;
                        return [4 /*yield*/, this.tokenContract().methods.symbol().call()];
                    case 1:
                        _a.tokenSymbol = _c.apply(_b, [_d.sent()]);
                        return [2 /*return*/, this.tokenSymbol];
                }
            });
        });
    };
    Exchange.prototype.updateTokenName = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this;
                        _c = (_b = web3.utils).hexToString;
                        return [4 /*yield*/, this.tokenContract().methods.name().call()];
                    case 1:
                        _a.tokenName = _c.apply(_b, [_d.sent()]);
                        return [2 /*return*/, this.tokenName];
                }
            });
        });
    };
    Exchange.prototype.updateDecimals = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        _b = parseInt;
                        return [4 /*yield*/, this.exchangeContract().methods.decimals().call()];
                    case 1:
                        _a.decimals = _b.apply(void 0, [_c.sent()]);
                        return [2 /*return*/, this.decimals];
                }
            });
        });
    };
    Exchange.prototype.updateTokenAddress = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.exchangeContract().methods.tokenAddress().call()];
                    case 1:
                        _a.tokenAddress = _b.sent();
                        return [2 /*return*/, this.tokenAddress];
                }
            });
        });
    };
    Exchange.prototype.getState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var eth, tokens, liquidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ethReserve()];
                    case 1:
                        eth = _a.sent();
                        return [4 /*yield*/, this.tokenReserve()];
                    case 2:
                        tokens = _a.sent();
                        return [4 /*yield*/, this.totalSupply()];
                    case 3:
                        liquidity = _a.sent();
                        this.state = new State_1.State(eth, tokens, liquidity);
                        return [2 /*return*/, this.state];
                }
            });
        });
    };
    Exchange.prototype.getStateFromLogs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            fromBlock: 6627944,
                            toBlock: 'latest'
                        };
                        return [4 /*yield*/, this.exchangeContract().getPastEvents("allEvents", options)];
                    case 1:
                        events = _a.sent();
                        return [2 /*return*/, events.reduce(function (state, event) {
                                console.log(event);
                                return state.addEvent(event).toState;
                            }, new State_1.State())];
                }
            });
        });
    };
    Exchange.prototype.toString = function () {
        return this.tokenSymbol + "(" + this.ethReserve.toString() + ", " + this.tokenReserve.toString() + ", " + this.totalSupply.toString() + ")";
    };
    return Exchange;
}());
exports.Exchange = Exchange;
