import SlowKind = require('../slowKind');
import EpochLog = require('../epochs/epochLog');
import slowEventLoop = require('./slowEventLoop');


// TODO: doc...
export var setTimeout = setTimeoutForEpoch(null);


// TODO: doc...
export function clearTimeout(timeoutObject: Timer) {
    timeoutObject.cancel();
}


// TODO: doc...
export class Timer implements slowEventLoop.Entry {

    constructor(private epochLog: EpochLog, delay: number, callback: Function, args: any[]) {
        this.$slow = {
            kind: SlowKind.Timer,
            id: null,
            due: Date.now() + delay,
            callback: callback,
            arguments: args
        };
    }

    isBlocked() {
        return this.$slow.due > Date.now();
    }

    dispatch() {
        this.epochLog.deleted(this);
        this.$slow.callback.apply(void 0, this.$slow.arguments);
    }

    cancel() {
        this.epochLog.deleted(this);
        slowEventLoop.remove(this);
    }

    $slow: {
        kind: SlowKind;
        id: string;
        due: number;
        callback: Function;
        arguments: any[];
    };
}


// TODO: doc...
interface SetTimeoutFunction {
    (callback: Function, delay: number, ...args: any[]): Timer;
    forEpoch(epochLog: EpochLog): (callback: Function, delay: number, ...args: any[]) => Timer;
}


// TODO: doc...
function setTimeoutForEpoch(epochLog: EpochLog) {

    // TODO: caching...
    cache = cache || <any> new Map();
    if (cache.has(epochLog)) return cache.get(epochLog);

    // TODO: ...
    var result: SetTimeoutFunction = <any> ((callback: Function, delay: number, ...args: any[]) => {
        var timer = new Timer(epochLog, delay, callback, args);
        epochLog.created(timer);
        slowEventLoop.add(timer);
        return timer;
    });
    result.forEpoch = setTimeoutForEpoch;

    // TODO: caching...
    cache.set(epochLog, result);
    return result;
}


// TODO: ...
var cache: Map<EpochLog, SetTimeoutFunction>;
