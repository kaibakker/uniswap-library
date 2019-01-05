/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
import { State } from './State';
import { Delta } from './Delta';
export declare class Trade {
    toState: State;
    fromState: State;
    delta: Delta;
    events: any[];
    tx: any;
    constructor(toState: State, fromState: State, delta: Delta);
}
