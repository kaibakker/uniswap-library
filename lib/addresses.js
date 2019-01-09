"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var RINKEBY = {
    factoryAddress: '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36',
    exchangeAddresses: {
        addresses: [
            ['BAT', '0x9B913956036a3462330B0642B20D3879ce68b450'],
            ['DAI', '0x77dB9C915809e7BE439D2AB21032B1b8B58F6891'],
            ['MKR', '0x93bB63aFe1E0180d0eF100D774B473034fd60C36'],
            ['OMG', '0x26C226EBb6104676E593F8A070aD6f25cDa60F8D'],
        ],
        fromToken: {
            '0xDA5B056Cfb861282B4b59d29c9B395bcC238D29B': '0x9B913956036a3462330B0642B20D3879ce68b450',
            '0x2448eE2641d78CC42D7AD76498917359D961A783': '0x77dB9C915809e7BE439D2AB21032B1b8B58F6891',
            '0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85': '0x93bB63aFe1E0180d0eF100D774B473034fd60C36',
            '0x879884c3C46A24f56089f3bBbe4d5e38dB5788C0': '0x26C226EBb6104676E593F8A070aD6f25cDa60F8D',
        },
    },
    tokenAddresses: {
        addresses: [
            ['BAT', '0xDA5B056Cfb861282B4b59d29c9B395bcC238D29B'],
            ['DAI', '0x2448eE2641d78CC42D7AD76498917359D961A783'],
            ['MKR', '0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85'],
            ['OMG', '0x879884c3C46A24f56089f3bBbe4d5e38dB5788C0'],
        ],
    },
};
var MAIN = {
    factoryAddress: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95',
    exchangeAddresses: {
        addresses: [
            ['ANT', '0x077d52B047735976dfdA76feF74d4d988AC25196'],
            ['BAT', '0x2E642b8D59B45a1D8c5aEf716A84FF44ea665914'],
            ['CVC', '0x1C6c712b1F4a7c263B1DBd8F97fb447c945d3b9a'],
            ['DAI', '0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14'],
            ['FOAM', '0xf79cb3BEA83BD502737586A6E8B133c378FD1fF2'],
            ['FUN', '0x60a87cC7Fca7E53867facB79DA73181B1bB4238B'],
            ['GNO', '0xe8e45431b93215566BA923a7E611B7342Ea954DF'],
            ['GUSD', '0xD883264737Ed969d2696eE4B4cAF529c2Fc2A141'],
            ['KNC', '0x49c4f9bc14884f6210F28342ceD592A633801a8b'],
            ['LINK', '0xF173214C720f58E03e194085B1DB28B50aCDeeaD'],
            ['LOOM', '0x417CB32bc991fBbDCaE230C7c4771CC0D69daA6b'],
            ['MANA', '0xC6581Ce3A005e2801c1e0903281BBd318eC5B5C2'],
            ['MKR', '0x2C4Bd064b998838076fa341A83d007FC2FA50957'],
            ['NEXO', '0x069C97DBA948175D10af4b2414969e0B88d44669'],
            ['REP', '0x48B04d2A05B6B604d8d5223Fd1984f191DED51af'],
            ['RHOC', '0x394e524b47A3AB3D3327f7fF6629dC378c1494a3'],
            ['SALT', '0xC0C59cDe851bfcbdddD3377EC10ea54A18Efb937'],
            ['SNT', '0x1aEC8F11A7E78dC22477e91Ed924Fab46e3A88Fd'],
            ['SPANK', '0x4e395304655F0796bc3bc63709DB72173b9DdF98'],
            ['VERI', '0x17e5BF07D696eaf0d14caA4B44ff8A1E17B34de3'],
            ['WETH', '0xA2881A90Bf33F03E7a3f803765Cd2ED5c8928dFb'],
            ['ZRX', '0xaE76c84C9262Cdb9abc0C2c8888e62Db8E22A0bF'],
        ],
        fromToken: {
            '0x960b236A07cf122663c4303350609A66A7B288C0': '0x077d52B047735976dfdA76feF74d4d988AC25196',
            '0x0D8775F648430679A709E98d2b0Cb6250d2887EF': '0x2E642b8D59B45a1D8c5aEf716A84FF44ea665914',
            '0x41e5560054824eA6B0732E656E3Ad64E20e94E45': '0x1C6c712b1F4a7c263B1DBd8F97fb447c945d3b9a',
            '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359': '0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14',
            '0x4946Fcea7C692606e8908002e55A582af44AC121': '0xf79cb3BEA83BD502737586A6E8B133c378FD1fF2',
            '0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b': '0x60a87cC7Fca7E53867facB79DA73181B1bB4238B',
            '0x6810e776880C02933D47DB1b9fc05908e5386b96': '0xe8e45431b93215566BA923a7E611B7342Ea954DF',
            '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd': '0xD883264737Ed969d2696eE4B4cAF529c2Fc2A141',
            '0xdd974D5C2e2928deA5F71b9825b8b646686BD200': '0x49c4f9bc14884f6210F28342ceD592A633801a8b',
            '0x514910771AF9Ca656af840dff83E8264EcF986CA': '0xF173214C720f58E03e194085B1DB28B50aCDeeaD',
            '0xA4e8C3Ec456107eA67d3075bF9e3DF3A75823DB0': '0x417CB32bc991fBbDCaE230C7c4771CC0D69daA6b',
            '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942': '0xC6581Ce3A005e2801c1e0903281BBd318eC5B5C2',
            '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2': '0x2C4Bd064b998838076fa341A83d007FC2FA50957',
            '0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206': '0x069C97DBA948175D10af4b2414969e0B88d44669',
            '0x1985365e9f78359a9B6AD760e32412f4a445E862': '0x48B04d2A05B6B604d8d5223Fd1984f191DED51af',
            '0x168296bb09e24A88805CB9c33356536B980D3fC5': '0x394e524b47A3AB3D3327f7fF6629dC378c1494a3',
            '0x4156D3342D5c385a87D264F90653733592000581': '0xC0C59cDe851bfcbdddD3377EC10ea54A18Efb937',
            '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E': '0x1aEC8F11A7E78dC22477e91Ed924Fab46e3A88Fd',
            '0x42d6622deCe394b54999Fbd73D108123806f6a18': '0x4e395304655F0796bc3bc63709DB72173b9DdF98',
            '0x8f3470A7388c05eE4e7AF3d01D8C722b0FF52374': '0x17e5BF07D696eaf0d14caA4B44ff8A1E17B34de3',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': '0xA2881A90Bf33F03E7a3f803765Cd2ED5c8928dFb',
            '0xE41d2489571d322189246DaFA5ebDe1F4699F498': '0xaE76c84C9262Cdb9abc0C2c8888e62Db8E22A0bF',
        },
    },
    tokenAddresses: {
        addresses: [
            ['ANT', '0x960b236A07cf122663c4303350609A66A7B288C0'],
            ['BAT', '0x0D8775F648430679A709E98d2b0Cb6250d2887EF'],
            ['CVC', '0x41e5560054824eA6B0732E656E3Ad64E20e94E45'],
            ['DAI', '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359'],
            ['FOAM', '0x4946Fcea7C692606e8908002e55A582af44AC121'],
            ['FUN', '0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b'],
            ['GNO', '0x6810e776880C02933D47DB1b9fc05908e5386b96'],
            ['GUSD', '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd'],
            ['KNC', '0xdd974D5C2e2928deA5F71b9825b8b646686BD200'],
            ['LINK', '0x514910771AF9Ca656af840dff83E8264EcF986CA'],
            ['LOOM', '0xA4e8C3Ec456107eA67d3075bF9e3DF3A75823DB0'],
            ['MANA', '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'],
            ['MKR', '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'],
            ['NEXO', '0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206'],
            ['REP', '0x1985365e9f78359a9B6AD760e32412f4a445E862'],
            ['RHOC', '0x168296bb09e24A88805CB9c33356536B980D3fC5'],
            ['SALT', '0x4156D3342D5c385a87D264F90653733592000581'],
            ['SNT', '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E'],
            ['SPANK', '0x42d6622deCe394b54999Fbd73D108123806f6a18'],
            ['VERI', '0x8f3470A7388c05eE4e7AF3d01D8C722b0FF52374'],
            ['WETH', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
            ['ZRX', '0xE41d2489571d322189246DaFA5ebDe1F4699F498'],
        ],
    },
};
var SET_ADDRESSES = 'app/addresses/setAddresses';
var ADD_EXCHANGE = 'app/addresses/addExchange';
var initialState = RINKEBY;
exports.addExchange = function (_a) {
    var label = _a.label, exchangeAddress = _a.exchangeAddress, tokenAddress = _a.tokenAddress;
    return function (dispatch, getState) {
        var _a = getState().addresses, tokenAddresses = _a.tokenAddresses, exchangeAddresses = _a.exchangeAddresses;
        if (tokenAddresses.addresses.filter(function (_a) {
            var symbol = _a[0];
            return symbol === label;
        }).length) {
            return;
        }
        if (exchangeAddresses.fromToken[tokenAddresses]) {
            return;
        }
        dispatch({
            type: ADD_EXCHANGE,
            payload: {
                label: label,
                exchangeAddress: exchangeAddress,
                tokenAddress: tokenAddress,
            },
        });
    };
};
exports.setAddresses = function (networkId) {
    switch (networkId) {
        // Main Net
        case 1:
        case '1':
            return {
                type: SET_ADDRESSES,
                payload: MAIN,
            };
        // Rinkeby
        case 4:
        case '4':
        default:
            return {
                type: SET_ADDRESSES,
                payload: RINKEBY,
            };
    }
};
exports.default = (function (state, _a) {
    if (state === void 0) { state = initialState; }
    var type = _a.type, payload = _a.payload;
    switch (type) {
        case SET_ADDRESSES:
            return payload;
        case ADD_EXCHANGE:
            return handleAddExchange(state, { payload: payload });
        default:
            return state;
    }
});
function handleAddExchange(state, _a) {
    var payload = _a.payload;
    var _b;
    var label = payload.label, tokenAddress = payload.tokenAddress, exchangeAddress = payload.exchangeAddress;
    if (!label || !tokenAddress || !exchangeAddress) {
        return state;
    }
    return __assign({}, state, { exchangeAddresses: __assign({}, state.exchangeAddresses, { addresses: state.exchangeAddresses.addresses.concat([
                [label, exchangeAddress]
            ]), fromToken: __assign({}, state.exchangeAddresses.fromToken, (_b = {}, _b[tokenAddress] = exchangeAddress, _b)) }), tokenAddresses: __assign({}, state.tokenAddresses, { addresses: state.tokenAddresses.addresses.concat([
                [label, tokenAddress]
            ]) }) });
}
