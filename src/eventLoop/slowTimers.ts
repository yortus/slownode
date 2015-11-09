import SlowKind = require('../slowKind');
import persistence = require('../persistence');
import slowEventLoop = require('./slowEventLoop');


// TODO: doc...
export var setTimeout = setTimeoutForEpoch(null);


// TODO: doc...
export function clearTimeout(timeoutObject: Timer) {
    timeoutObject.cancel();
}


// TODO: doc...
export class Timer implements slowEventLoop.Entry {

    constructor(private epochId: string, delay: number, callback: Function, args: any[]) {
        this.$slow = {
            kind: SlowKind.Timer,
            epochId: epochId,
            id: null,
            due: Date.now() + delay,
            callback: callback,
            arguments: args
        };
        persistence.created(this);
    }

    isBlocked() {
        return this.$slow.due > Date.now();
    }

    dispatch() {
        persistence.deleted(this);
        this.$slow.callback.apply(void 0, this.$slow.arguments);
    }

    cancel() {
        persistence.deleted(this);
        slowEventLoop.remove(this);
    }

    $slow: {
        kind: SlowKind;
        epochId: string;
        id: string;
        due: number;
        callback: Function;
        arguments: any[];
    };
}


// TODO: doc...
interface SetTimeoutFunction {
    (callback: Function, delay: number, ...args: any[]): Timer;
    forEpoch(epochId: string): (callback: Function, delay: number, ...args: any[]) => Timer;
}


// TODO: doc...
function setTimeoutForEpoch(epochId: string) {

    // TODO: caching... NB can use a normal obj now that key is a string
    cache = cache || <any> new Map();
    if (cache.has(epochId)) return cache.get(epochId);

    // TODO: ...
    var result: SetTimeoutFunction = <any> ((callback: Function, delay: number, ...args: any[]) => {
        var timer = new Timer(epochId, delay, callback, args);
        slowEventLoop.add(timer);
        return timer;
    });
    result.forEpoch = setTimeoutForEpoch;

    // TODO: caching...
    cache.set(epochId, result);
    return result;
}


// TODO: ... NB can use a normal obj now that key is a string
var cache: Map<string, SetTimeoutFunction>;





// TODO: ==================== rehydration logic... temp testing... ====================
persistence.howToRehydrate(SlowKind.Timer, $slow => {
    var timer = setTimeoutForEpoch($slow.epochId)(null, 0);
    timer.$slow = <any> $slow;
    return timer;
});
