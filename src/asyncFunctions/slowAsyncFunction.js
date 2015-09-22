var assert = require('assert');
var makeCallableClass = require('../util/makeCallableClass');
var shasum = require('../util/shasum');
var SteppableFunction = require('../steppables/steppableFunction');
var SlowPromise = require('../promises/slowPromise');
var SlowAsyncFunctionActivation = require('./slowAsyncFunctionActivation');
var storage = require('../storage/storage');
/**
 * Creates a SlowAsyncFunction instance. It may be called with or without `new`.
 * A slow async function is analogous to an ES7 async function.
 */
var SlowAsyncFunction;
// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowAsyncFunction = makeCallableClass({
    // Create a new SlowAsyncFunction instance that runs the given body function.
    constructor: function (bodyFunc) {
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
        this.stateMachine = steppableFunc.stateMachine;
        this.$slow = {
            type: 20 /* SlowAsyncFunction */,
            id: safid,
            stateMachineSource: steppableFunc.stateMachine.toString(),
            originalSource: originalSource
        };
        // Cache this SlowAsyncFunction instance to save re-computing it again.
        asyncFunctionCache[safid] = this;
        // Synchronise with the persistent object graph.
        storage.created(this);
    },
    // Calling the instance begins execution of the body function, and returns a promise of its outcome.
    call: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // Create a new SlowPromise to represent the eventual result of the slow async operation.
        var deferred = SlowPromise.deferred();
        // Create a new SlowAsyncFunctionActivation instance to run the async operation.
        var safa = new SlowAsyncFunctionActivation(this, deferred.resolve, deferred.reject, args);
        // Run the async operation to completion, and return a promise of the outcome.
        safa.runToCompletion(safa);
        return deferred.promise;
    }
});
/** Supports memoization of SlowAsyncFunction instances, which are immutable and expensive to compute. */
var asyncFunctionCache = {};
// Tell storage how to create a SlowAsyncFunction instance.
storage.registerSlowObjectFactory(20 /* SlowAsyncFunction */, function ($slow) {
    var saf = new SlowAsyncFunction(function () { });
    saf.$slow = $slow;
    saf.stateMachine = eval("(" + saf.$slow.stateMachineSource + ")");
    return saf;
});
module.exports = SlowAsyncFunction;
//# sourceMappingURL=slowAsyncFunction.js.map