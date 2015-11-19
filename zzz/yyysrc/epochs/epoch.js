//import assert = require('assert');
//import vm = require('vm');
//import API = require('../index.d.ts'); // NB: elided ref (for types only)
//import SlowKind = require('../slowKind');
//import persistence = require('../persistence');
//import slowEventLoop = require('../eventLoop/slowEventLoop');
//import slowTimers = require('../eventLoop/slowTimers');
////import SlowPromise = require('../promises/slowPromise');
////import SlowClosure = require('../functions/slowClosure');
////import SlowAsyncFunction = require('../functions/slowAsyncFunction');
//export = Epoch;
//class Epoch implements API.Epoch {
//    constructor(code: string, epochId?: string) {
//        // TODO: set default (random?) epoch id if none specified
//        this.EPOCH = epochId;
//        vm.createContext(this);
//        this.setTimeout(code, 0);
//    }
//    EPOCH: string;
//    setTimeout = slowTimers.createSetTimeoutFunction(this);
//    clearTimeout = slowTimers.clearTimeout;
////    Promise = SlowPromise.forEpoch(this);
//    // TODO: other 'global' stuff:
//    console = global.console;
//    global = global.global;
//}
//// TODO: temp testing
//interface Timer { }
////export interface Epoch extends API.Epoch {
////    // TODO: doc... INTERNAL
////    id: string; // TODO: get rid of this
////}
////// TODO: temp testing...
////function createEpoch(epochId: string): Epoch {
////    var epoch = <Epoch> {
////        setTimeout: null,
////        clearTimeout: slowTimers.clearTimeout,
////        //Promise: SlowPromise.forEpoch(epochId),
////        //closure: SlowClosure.forEpoch(epochId),
////        //async: null,
////        id: epochId
////    };
////    epoch.setTimeout = slowTimers.setTimeout.forEpoch(epochId, epoch);
////    //epoch.async = createAsyncFunctionForEpoch(epoch);
////    return epoch;
////}
//// TODO: temp testing...
////function createAsyncFunctionForEpoch(epoch: Epoch) {
////    var async = SlowAsyncFunction.forEpoch(epoch.id);
////    var options = { require };
////    var result = (bodyFunc: Function) => async(bodyFunc, options);
////    return result;
////    function require(moduleId: string) {
////        if (moduleId === 'epoch') return epoch;
////        return mainRequire(moduleId);
////    }
////}
//// TODO: temp testing...
////var mainRequire = require.main.require;
//# sourceMappingURL=epoch.js.map