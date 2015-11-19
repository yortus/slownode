var assert = require('assert');
var persistence = require('../persistence');
var makeCallableClass = require('../util/makeCallableClass');
var shasum = require('../util/shasum');
var SteppableFunction = require('../steppables/steppableFunction');
var SlowAsyncFunctionActivation = require('./slowAsyncFunctionActivation');
/**
 * Creates a SlowAsyncFunction instance. It may be called with or without `new`.
 * A slow async function is analogous to an ES7 async function, but with persistence.
 */
var SlowAsyncFunction = makeCallableClass({
    // Create a new SlowAsyncFunction instance that runs the given body function.
    constructor: function (bodyFunc, options) {
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
        var steppableOptions = {
            pseudoYield: 'await',
            pseudoConst: '__const',
            require: options ? options.require : null
        };
        var steppableFunc = new SteppableFunction(bodyFunc, steppableOptions);
        self.stateMachine = steppableFunc.stateMachine;
        self.$slow = {
            kind: 300 /* AsyncFunction */,
            id: safid,
            stateMachineSource: steppableFunc.stateMachine.toString(),
            originalSource: originalSource
        };
        // Cache this SlowAsyncFunction instance to save re-computing it again.
        asyncFunctionCache[safid] = self;
        // Synchronise with the persistent object graph.
        persistence.created(self);
    },
    // Calling the instance begins execution of the body function, and returns a promise of its outcome.
    call: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // Create a new SlowAsyncFunctionActivation instance to run the async operation.
        var safa = new SlowAsyncFunctionActivation(this, args); // TODO: must be log-bound SAFA!
        // Run the async operation to completion, and return a promise of the outcome.
        safa.runToCompletion(safa);
        return safa.result;
    }
});
/** Supports memoization of SlowAsyncFunction instances, which are immutable and expensive to compute. */
// TODO: when used?
// TODO: rename: instanceCache
var asyncFunctionCache = {};
// TODO: ==================== rehydration logic... temp testing... ====================
persistence.howToRehydrate(300 /* AsyncFunction */, function ($slow) {
    var saf = SlowAsyncFunction(function () { });
    saf.$slow = $slow;
    saf.stateMachine = eval("(" + $slow.stateMachineSource + ")");
    return saf;
});
module.exports = SlowAsyncFunction;
//# sourceMappingURL=slowAsyncFunction.js.map