import assert = require('assert');
import EpochLog = require('./epochLog');
import SlowKind = require('../slowKind');
import slowEventLoop = require('../eventLoop/slowEventLoop');
import slowTimers = require('../eventLoop/slowTimers');
import SlowPromise = require('../promises/slowPromise');
import SlowClosure = require('../functions/slowClosure');
import SlowAsyncFunction = require('../functions/slowAsyncFunction');


export function open(path: string) {

    // TODO: need orderly attach/detach in pairs. This will never be detached!! And will keep ref to epoch/log alive!
    slowEventLoop.beforeNextTick.attach(() => {
        epochLog.flush();
        return Promise.resolve<void>();
    });

    var epochLog = new EpochLog();

    var epoch = <Epoch> {
        setTimeout: slowTimers.setTimeout.forEpoch(epochLog),
        clearTimeout: slowTimers.clearTimeout,
        Promise: SlowPromise.forEpoch(epochLog),
        closure: SlowClosure.forEpoch(epochLog),
        async: null,
        addWeakRef: (obj: any) => {
            assert(obj && (typeof obj === 'object' || typeof obj === 'function'), 'addWeakRef: argument must be an object');
            assert(!obj.$slow, 'addWeakRef: argument is already a slow object');
            obj.$slow = { kind: SlowKind.WeakRef };
            epochLog.created(obj);
        },
        log: epochLog
    };

    epoch.async = makeAsyncFunctionForEpoch(epoch);

    return epoch;
}


export function close(epoch: Epoch) {

    // TODO: explicit disposal...

}


export interface Epoch {

    // TODO: doc...
    setTimeout: (callback: Function, delay: number, ...args: any[]) => slowTimers.Timer;

    // TODO: doc...
    clearTimeout: (timeoutObject: slowTimers.Timer) => void;

    // TODO: doc...
    Promise: typeof SlowPromise;

    // TODO: doc...
    closure: typeof SlowClosure;

    // TODO: doc...
    async: (bodyFunc: Function) => SlowAsyncFunction;

    // TODO: doc...
    addWeakRef: (obj: any) => void;

    // TODO: doc... INTERNAL
    log: EpochLog;
}


// TODO: temp testing...
function makeAsyncFunctionForEpoch(epoch: Epoch) {
    var async = SlowAsyncFunction.forEpoch(epoch.log);
    var options = { require };
    var result = (bodyFunc: Function) => async(bodyFunc, options);
    return result;

    function require(moduleId: string) {
        if (moduleId === 'epoch') return epoch;
        return mainRequire(moduleId);
    }
}


// TODO: temp testing...
var mainRequire = require.main.require;
