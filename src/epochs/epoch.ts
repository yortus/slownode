import assert = require('assert');
import API = require('../index.d.ts'); // NB: elided ref (for types only)
import SlowKind = require('../slowKind');
import persistence = require('../persistence');
import slowEventLoop = require('../eventLoop/slowEventLoop');
import slowTimers = require('../eventLoop/slowTimers');
import SlowPromise = require('../promises/slowPromise');
import SlowClosure = require('../functions/slowClosure');
import SlowAsyncFunction = require('../functions/slowAsyncFunction');


export function open(path: string, flags: string): Epoch {


    // TODO: fully review!!!

    // TODO: temp testing...
    var epochId = 'TEST';

    var epoch = createEpoch(epochId);
    return epoch;
}


export function close(epoch: Epoch) {

    // TODO: explicit disposal...

}


export interface Epoch extends API.Epoch {

    // TODO: doc... INTERNAL
    id: string;
}


// TODO: temp testing...
function createEpoch(epochId: string): Epoch {


    var epoch = <Epoch> {
        setTimeout: slowTimers.setTimeout.forEpoch(epochId),
        clearTimeout: slowTimers.clearTimeout,
        Promise: SlowPromise.forEpoch(epochId),
        closure: SlowClosure.forEpoch(epochId),
        async: null,
        addWeakRef: (obj: any) => {
            assert(obj && (typeof obj === 'object' || typeof obj === 'function'), 'addWeakRef: argument must be an object');
            assert(!obj.$slow, 'addWeakRef: argument is already a slow object');
            obj.$slow = { kind: SlowKind.WeakRef };
            persistence.created(obj);
        },
        id: epochId
    };
    epoch.async = createAsyncFunctionForEpoch(epoch);
    return epoch;
}


// TODO: temp testing...
function createAsyncFunctionForEpoch(epoch: Epoch) {
    var async = SlowAsyncFunction.forEpoch(epoch.id);
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
