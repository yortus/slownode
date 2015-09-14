var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var assert = require('assert');
var makeCallableClass = require('../util/makeCallableClass');
var shasum = require('../util/shasum');
var SteppableFunction = require('../functions/steppableFunction');
var SteppableObject = require('../functions/steppableObject');
var SlowPromise = require('../promises/slowPromise');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
// TODO: doc...
var asyncPseudoKeyword = makeCallableClass({
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
        this._slow = {
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
    call: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // Create a new SlowPromise to represent the eventual result of the slow async operation.
        var deferred = SlowPromise.deferred();
        // Create a new SlowAsyncFunctionActivation instance to run the async operation.
        var safa = new SlowAsyncFunctionActivation(this.stateMachine, args, this, deferred);
        // Run the async operation to completion, and return a promise of the outcome.
        runToCompletion(safa);
        return deferred.promise;
    }
});
/** Supports memoization of SlowAsyncFunction instances, which are immutable and expensive to compute. */
var asyncFunctionCache = {};
/** A SlowAsyncFunctionActivation is a SteppableObject with additional properties. */
var SlowAsyncFunctionActivation = (function (_super) {
    __extends(SlowAsyncFunctionActivation, _super);
    function SlowAsyncFunctionActivation(stateMachine, args, asyncFunction, deferred) {
        _super.call(this, stateMachine);
        this.asyncFunction = asyncFunction;
        this.deferred = deferred;
        this._slow = {
            type: 30 /* SlowAsyncFunctionActivation */,
            asyncFunction: this.asyncFunction,
            state: this.state,
            awaiting: null,
            onAwaitedResult: makeContinuationResultHandler(this),
            onAwaitedError: makeContinuationErrorHandler(this),
            resolve: this.deferred.resolve,
            reject: this.deferred.reject
        };
        this.state = { local: { arguments: args } };
        // Synchronise with the persistent object graph.
        storage.created(this);
    }
    return SlowAsyncFunctionActivation;
})(SteppableObject);
// TODO: temp testing...
//function tween(stateMachineSource: string, originalSource: string) {
//    var stateMachine = eval('(' + stateMachineSource + ')');
//    var steppableFunc = SteppableFunction.fromStateMachine(stateMachine);
//    return makeSlowAsyncFunction(steppableFunc, stateMachineSource, originalSource);
//}
// TODO: doc...
function makeContinuationResultHandler(safa) {
    // Make a function that resumes the given activation with a 'next' value.
    var continuation = function (value) { return runToCompletion(safa, null, value); };
    // Add slow metadata to the continuation function.
    continuation._slow = { type: 31 /* SlowAsyncFunctionContinuationWithResult */, safa: safa };
    // Synchronise with the persistent object graph.
    storage.created(continuation);
    // Return the continuation.
    return continuation;
}
// TODO: doc...
function makeContinuationErrorHandler(safa) {
    // Make a function that resumes the given activation, throwing the given error into it.
    var continuation = function (error) { return runToCompletion(safa, error); };
    // Add slow metadata to the continuation function.
    continuation._slow = { type: 32 /* SlowAsyncFunctionContinuationWithError */, safa: safa };
    // Synchronise with the persistent object graph.
    storage.created(continuation);
    // Return the continuation.
    return continuation;
}
module.exports = asyncPseudoKeyword;
// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowAsyncFunction,
//    dehydrate: (p: types.SlowAsyncFunction, recurse: (obj) => any) => {
//        if (!p || !p._slow || p._slow.type !== SlowType.SlowAsyncFunction) return;
//        var jsonSafeObject = _.mapValues(p._slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => {
//        // TODO: clean up
//        return tween(jsonSafeObject.stateMachineSource, jsonSafeObject.originalSource);
//    }
//});
//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowAsyncFunctionActivation,
//    dehydrate: (p: types.SlowAsyncFunction.Activation, recurse: (obj) => any) => {
//        if (!p || !p._slow || p._slow.type !== SlowType.SlowAsyncFunctionActivation) return;
//        var jsonSafeObject = _.mapValues(p._slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => {
//        var safa: types.SlowAsyncFunction.Activation = <any> new Steppable(jsonSafeObject.asyncFunction.stateMachine);
//        safa.state = jsonSafeObject.state;
//        safa._slow = jsonSafeObject;
//        safa._slow.onAwaitedResult = makeContinuationResultHandler(safa);
//        safa._slow.onAwaitedError = makeContinuationErrorHandler(safa);
//        // TODO: and continue running it...
//        //assert(safa._slow.awaiting); // should only ever be rehydrating from an awaiting state
//        //safa._slow.awaiting.then(safa._slow.onAwaitedResult, safa._slow.onAwaitedError);
//        // All done.
//        return safa;
//    }
//});
//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowAsyncFunctionContinuationWithResult,
//    dehydrate: (p: any, recurse: (obj) => any) => {
//        if (!p || !p._slow || p._slow.type !== SlowType.SlowAsyncFunctionContinuationWithResult) return;
//        var jsonSafeObject = _.mapValues(p._slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => makeContinuationResultHandler(jsonSafeObject.safa)
//});
//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowAsyncFunctionContinuationWithError,
//    dehydrate: (p: any, recurse: (obj) => any) => {
//        if (!p || !p._slow || p._slow.type !== SlowType.SlowAsyncFunctionContinuationWithError) return;
//        var jsonSafeObject = _.mapValues(p._slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => makeContinuationErrorHandler(jsonSafeObject.safa)
//});
//# sourceMappingURL=asyncPseudoKeyword.js.map