var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var assert = require('assert');
var SlowLog = require('../slowLog');
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
            kind: 20 /* AsyncFunction */,
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
        var safa = new SlowAsyncFunctionActivation(this, deferred.resolve, deferred.reject, args); // TODO: must be log-bound SAFA!
        // Run the async operation to completion, and return a promise of the outcome.
        safa.runToCompletion(safa);
        return deferred.promise;
    }
});
// Set the static '$slowLog' property on the SlowAsyncFunction callable class.
SlowAsyncFunction.$slowLog = SlowLog.none;
// Define the static `logged` method on the SlowAsyncFunction callable class.
SlowAsyncFunction.logged = function (log) {
    // Return the cached constructor if one has already been created.
    var cached = log['_SlowAsyncFunction'];
    if (cached)
        return cached;
    // Derive a new subclass of SlowAsyncFunction that is bound to the given slow log.
    var SlowAsyncFunctionLogged = (function (_super) {
        __extends(SlowAsyncFunctionLogged, _super);
        function SlowAsyncFunctionLogged(bodyFunc) {
            return _super.call(this, bodyFunc);
        }
        SlowAsyncFunctionLogged.$slowLog = log;
        SlowAsyncFunctionLogged.logged = SlowAsyncFunction.logged;
        return SlowAsyncFunctionLogged;
    })(SlowAsyncFunction);
    ;
    // Cache and return the constructor function.
    log['_SlowAsyncFunction'] = SlowAsyncFunctionLogged;
    return SlowAsyncFunctionLogged;
};
/** Supports memoization of SlowAsyncFunction instances, which are immutable and expensive to compute. */
var asyncFunctionCache = {};
// Tell storage how to create a SlowAsyncFunction instance.
storage.registerSlowObjectFactory(20 /* AsyncFunction */, function ($slow) {
    var saf = new SlowAsyncFunction(function () { });
    saf.$slow = $slow;
    saf.stateMachine = eval("(" + saf.$slow.stateMachineSource + ")");
    return saf;
});
module.exports = SlowAsyncFunction;
//# sourceMappingURL=slowAsyncFunction.js.map