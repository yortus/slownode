import assert = require('assert');
import vm = require('vm');
import API = require('../index.d.ts'); // NB: elided ref (for types only)
import SlowKind = require('../slowKind');
import persistence = require('../persistence');
import slowEventLoop = require('../eventLoop/slowEventLoop');
import slowTimers = require('../eventLoop/slowTimers');
//import SlowPromise = require('../promises/slowPromise');
//import SlowClosure = require('../functions/slowClosure');
//import SlowAsyncFunction = require('../functions/slowAsyncFunction');
export = Epoch;


class Epoch {

    constructor(epochId: string, code: Function, ...args: any[]) {
        vm.createContext(this);
        this.setTimeout = slowTimers.createSetTimeoutFunction(this);
        this.clearTimeout = slowTimers.clearTimeout;

        // TODO: execute the code inside this new epoch
        this.setTimeout(code, 0, ...args);
    }

    /**
     * Schedules `callback` to be called with the given `args` (if any) after `delay` milliseconds.
     * Returns an opaque Timer object that may be passed to clearTimeout() to cancel the scheduled call.
     * @param callback the function to execute after the timeout.
     * @param delay the number of milliseconds to wait before calling the callback.
     * @param args the optional arguments to pass to the callback.
     */
    setTimeout: (callback: Function, delay: number, ...args: any[]) => Timer;

    /**
     * Cancels an event previously scheduled with setTimeout.
     * @param timeoutObject an opaque Timer object that was returned by a prior call to setTimeout.
     */
    clearTimeout: (timeoutObject: Timer) => void;

    // TODO: other 'global' stuff:
    console = global.console;
    global = global.global;
}


// TODO: temp testing
interface Timer { }




//export interface Epoch extends API.Epoch {

//    // TODO: doc... INTERNAL
//    id: string; // TODO: get rid of this
//}


//// TODO: temp testing...
//function createEpoch(epochId: string): Epoch {


//    var epoch = <Epoch> {
//        setTimeout: null,
//        clearTimeout: slowTimers.clearTimeout,
//        //Promise: SlowPromise.forEpoch(epochId),
//        //closure: SlowClosure.forEpoch(epochId),
//        //async: null,
//        id: epochId
//    };
//    epoch.setTimeout = slowTimers.setTimeout.forEpoch(epochId, epoch);
//    //epoch.async = createAsyncFunctionForEpoch(epoch);
//    return epoch;
//}


// TODO: temp testing...
//function createAsyncFunctionForEpoch(epoch: Epoch) {
//    var async = SlowAsyncFunction.forEpoch(epoch.id);
//    var options = { require };
//    var result = (bodyFunc: Function) => async(bodyFunc, options);
//    return result;

//    function require(moduleId: string) {
//        if (moduleId === 'epoch') return epoch;
//        return mainRequire(moduleId);
//    }
//}


// TODO: temp testing...
//var mainRequire = require.main.require;
