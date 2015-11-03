var assert = require('assert');
var makeCallableClass = require('../util/makeCallableClass');
var shasum = require('../util/shasum');
var SteppableFunction = require('../steppables/steppableFunction');
var SlowPromise = require('../promises/slowPromise');
var SlowAsyncFunctionActivation = require('./slowAsyncFunctionActivation');
/**
 * Creates a SlowAsyncFunction instance. It may be called with or without `new`.
 * A slow async function is analogous to an ES7 async function, but with persistence.
 */
var SlowAsyncFunction = slowAsyncFunctionForEpoch(null);
// TODO: doc...
function slowAsyncFunctionForEpoch(epochLog) {
    // TODO: caching...
    cache = cache || new Map();
    if (cache.has(epochLog))
        return cache.get(epochLog);
    // Create a constructor function whose instances (a) are callable and (b) work with instanceof.
    var result = makeCallableClass({
        // Create a new SlowAsyncFunction instance that runs the given body function.
        constructor: function (bodyFunc) {
            var self = this;
            // Validate arguments.
            assert(typeof bodyFunc === 'function');
            // Get the shasum of the body function's source code. This is used
            // to uniquely identify the SlowAsyncFunction for caching purposes.
            var originalSource = bodyFunc.toString();
            var safid = shasum(originalSource);
            // Return the cached SlowAsyncFunction instance immediately if there is one.
            var cached = asyncFunctionCache[safid];
            if (cached)
                return cached;
            // Create a new SlowAsyncFunction instance.
            var steppableFunc = new SteppableFunction(bodyFunc, { pseudoYield: 'await', pseudoConst: '__const' });
            self.stateMachine = steppableFunc.stateMachine;
            self.$slow = {
                kind: 20 /* AsyncFunction */,
                id: safid,
                stateMachineSource: steppableFunc.stateMachine.toString(),
                originalSource: originalSource
            };
            // Cache this SlowAsyncFunction instance to save re-computing it again.
            asyncFunctionCache[safid] = self;
            // Synchronise with the persistent object graph.
            epochLog.created(self);
        },
        // Calling the instance begins execution of the body function, and returns a promise of its outcome.
        call: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            // Create a new SlowPromise to represent the eventual result of the slow async operation.
            var deferred = SlowPromise.forEpoch(epochLog).deferred();
            // Create a new SlowAsyncFunctionActivation instance to run the async operation.
            var safa = new SlowAsyncFunctionActivation(epochLog, this, deferred.resolve, deferred.reject, args); // TODO: must be log-bound SAFA!
            // Run the async operation to completion, and return a promise of the outcome.
            safa.runToCompletion(safa);
            return deferred.promise;
        }
    });
    // TODO: ...
    result.forEpoch = slowAsyncFunctionForEpoch;
    // TODO: caching...
    cache.set(epochLog, result);
    return result;
}
/** Supports memoization of SlowAsyncFunction instances, which are immutable and expensive to compute. */
// TODO: when used?
// TODO: rename: instanceCache
var asyncFunctionCache = {};
// TODO: doc...
// TODO: rename: constructorCache
var cache;
module.exports = SlowAsyncFunction;
//# sourceMappingURL=slowAsyncFunction.js.map