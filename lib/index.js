"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("./Factory");
var Exchange_1 = require("./Exchange");
var State_1 = require("./State");
var Trade_1 = require("./Trade");
var addresses_1 = require("./addresses");
var NETWORK_ID = 1;
var addresses = addresses_1.setAddresses(NETWORK_ID);
exports.default = {
    Factory: Factory_1.Factory,
    Exchange: Exchange_1.Exchange,
    State: State_1.State,
    Trade: Trade_1.Trade,
    addresses: addresses
};
