var vm = require('vm');
var slowTimers = require('../eventLoop/slowTimers');
var SlowPromise = require('../promises/slowPromise');
var Epoch = (function () {
    function Epoch(epochId, code) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.setTimeout = slowTimers.createSetTimeoutFunction(this);
        this.clearTimeout = slowTimers.clearTimeout;
        this.Promise = SlowPromise.forEpoch(this);
        // TODO: other 'global' stuff:
        this.console = global.console;
        this.global = global.global;
        vm.createContext(this);
        this.setTimeout.apply(this, [code, 0].concat(args));
    }
    return Epoch;
})();
module.exports = Epoch;
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
//# sourceMappingURL=epoch.js.map