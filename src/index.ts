
import { Factory } from './Factory';
import { Exchange } from './Exchange';
import { State } from './State';
import { Trade } from './Trade';
import { Delta } from './Delta';
import { setAddresses } from './addresses';

const NETWORK_ID = 1;
const addresses = setAddresses(NETWORK_ID)


export default {
    Factory,
    Exchange,
    State,
    Trade,
    Delta,
    addresses
}