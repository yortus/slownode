var assert = require('assert');
var crypto = require('crypto');
var Steppable = require('../functions/steppable');
var SteppableFunction = require('../functions/steppableFunction');
var SlowPromise = require('../promises/slowPromise');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
// TODO: internal factory function to create a 'blank' SlowAsyncFunction whose props can be assigned after creation
//function create(): types.SlowAsyncFunction {
//    var result = (...args) => {
//    }
//}
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
    // Get all inforation required to create the AsyncFunction instance, based on the given bodyFunc.
    // TODO: optimise! SteppableFunction is VERY EXPENSIVE!!!
    //       - better: hash the original source instead of the steppableFunc source, and only make a new steppableFunc if the hash hasn't already been created.
    var steppableFunc = SteppableFunction(bodyFunc, { pseudoYield: 'await', pseudoConst: '__const' });
    var stateMachineSource = steppableFunc.stateMachine.toString();
    var originalSource = bodyFunc.toString();
    var asyncFunction = makeSlowAsyncFunction(steppableFunc, stateMachineSource, originalSource);
    // Synchronise with the persistent object graph.
    storage.created(asyncFunction);
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
    // TODO: ...
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
        // A SlowAsyncFunctionActivation object is just a Steppable object with additional metadata.
        // TODO: subclass Steppable so we have a runtime-identifiable prototype?
        var safa = steppableFunc.apply(steppableFunc, args);
        // Add slow state to the SlowAsyncFunctionActivation instance.
        safa._slow = {
            type: 30 /* SlowAsyncFunctionActivation */,
            asyncFunction: asyncFunction,
            state: safa.state,
            awaiting: null,
            onAwaitedResult: makeContinuationResultHandler(safa, true),
            onAwaitedError: makeContinuationErrorHandler(safa, true),
            resolve: deferred.resolve,
            reject: deferred.reject
        };
        // Synchronise with the persistent object graph.
        storage.created(safa);
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
function makeContinuationResultHandler(safa, persist) {
    // Make a function that resumes the given activation with a 'next' value.
    var continuation = function (value) { return runToCompletion(safa, null, value); };
    // Add slow metadata to the continuation function.
    continuation._slow = { type: 31 /* SlowAsyncFunctionContinuationWithResult */, safa: safa };
    // Synchronise with the persistent object graph.
    // TODO: refactor this getting rid of conditional 'persist'
    if (persist)
        storage.created(continuation);
    // Return the continuation.
    return continuation;
}
// TODO: doc...
function makeContinuationErrorHandler(safa, persist) {
    // Make a function that resumes the given activation, throwing the given error into it.
    var continuation = function (error) { return runToCompletion(safa, error); };
    // Add slow metadata to the continuation function.
    continuation._slow = { type: 32 /* SlowAsyncFunctionContinuationWithError */, safa: safa };
    // Synchronise with the persistent object graph.
    // TODO: refactor this getting rid of conditional 'persist'
    if (persist)
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