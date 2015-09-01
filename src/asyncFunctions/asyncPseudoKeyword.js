var assert = require('assert');
var crypto = require('crypto');
var Steppable = require('../functions/steppable');
var SteppableFunction = require('../functions/steppableFunction');
var SlowPromise = require('../promises/slowPromise');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
// TODO: return something that really has a prototype of type SlowAsyncFunction?
//       - ie so the following makes sense at runtime: ... if (fn instanceof SlowAsyncFunction) {...}
//       - Is this even possible. How to create a 'function' object with a different prototype?
//       - See: https://gist.github.com/tcr/4416956
//       - See: http://stackoverflow.com/a/17111430/1075886
//       - See: http://stackoverflow.com/a/346666/1075886
// TODO: doc...
var asyncPseudoKeyword = (function (bodyFunc) {
    // Validate arguments.
    assert(typeof bodyFunc === 'function');
    // Compile the details of the AsyncFunction definition based on the given bodyFunc.
    // TODO: optimise! SteppableFunction is VERY EXPENSIVE!!!
    //       - better: hash the original source instead of the steppableFunc source, and only make a new steppableFunc if the hash hasn't already been created.
    var steppableFunc = SteppableFunction(bodyFunc, { pseudoYield: 'await', pseudoConst: '__const' });
    var stateMachineSource = steppableFunc.stateMachine.toString();
    var originalSource = bodyFunc.toString();
    var asyncFunction = makeSlowAsyncFunction(steppableFunc, stateMachineSource, originalSource);
    // Ensure the SlowAsyncFunction definition has been persisted to storage.
    storage.track(asyncFunction);
    // Return the SlowAsyncFunction instance.
    return asyncFunction;
});
// TODO: temp testing...
function tween(stateMachineSource, originalSource) {
    var stateMachine = eval('(' + stateMachineSource + ')');
    var steppableFunc = (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var steppable = new Steppable(stateMachine);
        steppable.state = { local: { arguments: args } };
        return steppable;
    });
    steppableFunc.stateMachine = stateMachine;
    return makeSlowAsyncFunction(steppableFunc, stateMachineSource, originalSource);
}
// TODO: doc...
function makeSlowAsyncFunction(steppableFunc, stateMachineSource, originalSource) {
    // Compile the details of the AsyncFunction definition based on the given bodyFunc.
    // TODO: optimise! SteppableFunction is VERY EXPENSIVE!!!
    //       - better: hash the original source instead of the steppableFunc source, and only make a new steppableFunc if the hash hasn't already been created.
    //var bodyFunc = _.isFunction(original) ? original : ???;
    //var originalSource = _.isString(original) ? original : ???;
    //var steppableFunc = SteppableFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    //var source = steppableFunc.body.toString();
    var asyncFunctionId = crypto.createHash('sha1').update(stateMachineSource).digest('hex').slice(0, 40);
    // Create the callable part of the SlowAsyncFunction object. When called, this function creates a new
    // SlowAsyncFunctionActivation object from the given SteppableFunction, and runs it to completion.
    var asyncFunction = (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // TODO: Create a new SlowPromise to represent the eventual result of the operation...
        var deferred = SlowPromise.deferred();
        // Create a new SlowAsyncFunctionActivation object using the given arguments.
        // TODO: subclass Steppable so we have an runtime-identifiable prototype?
        var safa = steppableFunc.apply(steppableFunc, args);
        // Add slow state to the SlowAsyncFunctionActivation instance.
        safa._slow = {
            type: 30 /* SlowAsyncFunctionActivation */,
            asyncFunction: asyncFunction,
            state: safa.state,
            awaiting: null,
            onAwaitedResult: null,
            onAwaitedError: null,
            resolve: deferred.resolve,
            reject: deferred.reject
        };
        // TODO: review below - got more complicated to ensure all ids are persisted and x-ref'd...
        // Persist the SlowAsyncFunctionActivation's initial state to the database.
        storage.track(safa);
        var onAwaitedResult = makeContinuationResultHandler(safa);
        var onAwaitedError = makeContinuationErrorHandler(safa);
        storage.track(onAwaitedResult);
        storage.track(onAwaitedError);
        safa._slow.onAwaitedResult = onAwaitedResult;
        safa._slow.onAwaitedError = onAwaitedError;
        storage.track(safa);
        // Run the SlowAsyncFunctionActivation instance to completion, and return the promise of completion.
        runToCompletion(safa);
        return deferred.promise;
    });
    // Add a reference to the stateMachine to the SlowAsyncFunction.
    asyncFunction.stateMachine = steppableFunc.stateMachine;
    // Add slow state to the SlowAsyncFunction instance.
    asyncFunction._slow = {
        type: 20 /* SlowAsyncFunction */,
        id: asyncFunctionId,
        stateMachineSource: stateMachineSource,
        originalSource: originalSource
    };
    // Return the SlowAsyncFunction instance.
    return asyncFunction;
}
// TODO: doc...
function makeContinuationResultHandler(safa) {
    var result = function (value) { return runToCompletion(safa, null, value); };
    result._slow = { type: 31 /* SlowAsyncFunctionContinuationWithResult */, safa: safa };
    return result;
}
function makeContinuationErrorHandler(safa) {
    var result = function (error) { return runToCompletion(safa, error); };
    result._slow = { type: 32 /* SlowAsyncFunctionContinuationWithError */, safa: safa };
    return result;
}
// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: 20 /* SlowAsyncFunction */,
    rehydrate: function (obj) {
        // TODO: clean up
        return tween(obj.stateMachineSource, obj.originalSource);
    }
});
// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: 30 /* SlowAsyncFunctionActivation */,
    rehydrate: function (obj) {
        var safa = new Steppable(obj.asyncFunction.stateMachine);
        safa.state = obj.state;
        safa._slow = obj;
        safa._slow.onAwaitedResult = makeContinuationResultHandler(safa);
        safa._slow.onAwaitedError = makeContinuationErrorHandler(safa);
        // TODO: and continue running it...
        assert(safa._slow.awaiting); // should only ever be rehydrating from an awaiting state
        safa._slow.awaiting.then(safa._slow.onAwaitedResult, safa._slow.onAwaitedError);
        // All done.
        return safa;
    }
});
// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: 31 /* SlowAsyncFunctionContinuationWithResult */,
    rehydrate: function (obj) { return makeContinuationResultHandler(obj.safa); }
});
// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: 32 /* SlowAsyncFunctionContinuationWithError */,
    rehydrate: function (obj) { return makeContinuationErrorHandler(obj.safa); }
});
module.exports = asyncPseudoKeyword;
//# sourceMappingURL=asyncPseudoKeyword.js.map