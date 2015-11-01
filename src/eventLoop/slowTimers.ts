import EpochJournal = require('../epochJournal');
import slowEventLoop = require('./slowEventLoop');


// TODO: doc...
export var setTimeout: {
    (callback: Function, delay: number, ...args: any[]): Timer;
    forEpoch(journal: EpochJournal): (callback: Function, delay: number, ...args: any[]): Timer;
};
setTimeout = <any> ((callback: Function, delay: number, ...args: any[]) => {
    var entry = new TimerEvent(delay, callback, args);
    eventLoop.enqueue(entry);
    return entry;
});
setTimeout.forEpoch = (journal: EpochJournal) => {
    // TODO: ...
    return null;
};


// TODO: doc...
export function clearTimeout() {
}


// TODO: doc...
export interface Timer extends slowEventLoop.Entry {
}
