var assert = require('assert');
var crypto = require('crypto');
var SlowPromise = require('../promises/slowPromise');
var SlowRoutineFunction = require('../coroutines/slowRoutineFunction');
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
    // TODO: optimise! SlowRoutineFunction is VERY EXPENSIVE!!!
    //       - better: hash the original source instead of the sloroFunc source, and only make a new sloroFunc if the hash hasn't already been created.
    var sloroFunc = SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    var stateMachineSource = sloroFunc.stateMachine.toString();
    var originalSource = bodyFunc.toString();
    var asyncFunction = makeSlowAsyncFunction(sloroFunc, stateMachineSource, originalSource);
    // Ensure the SlowAsyncFunction definition has been persisted to storage.
    storage.upsert(asyncFunction);
    // Return the SlowAsyncFunction instance.
    return asyncFunction;
});
// 1. { bodyFunc: Function }        ==>         { source: string, originalSource: string }      ==> sloroFunc
// 2.                                           { source: string, originalSource: string }      ==> sloroFunc
// TODO: doc...
function makeSlowAsyncFunction(sloroFunc, stateMachineSource, originalSource) {
    // Compile the details of the AsyncFunction definition based on the given bodyFunc.
    // TODO: optimise! SlowRoutineFunction is VERY EXPENSIVE!!!
    //       - better: hash the original source instead of the sloroFunc source, and only make a new sloroFunc if the hash hasn't already been created.
    //var bodyFunc = _.isFunction(original) ? original : ???;
    //var originalSource = _.isString(original) ? original : ???;
    //var sloroFunc = SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    //var source = sloroFunc.body.toString();
    var asyncFunctionId = crypto.createHash('sha1').update(stateMachineSource).digest('hex').slice(0, 40);
    // Create the callable part of the SlowAsyncFunction object. When called, this function creates a new
    // SlowAsyncFunctionActivation object from the given SlowRoutineFunction, and runs it to completion.
    var asyncFunction = (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // TODO: Create a new SlowPromise to represent the eventual result of the operation...
        var deferred = SlowPromise.deferred();
        // Create a new SlowAsyncFunctionActivation object using the given arguments.
        // TODO: subclass SlowRoutine so we have an runtime-identifiable prototype?
        var safa = sloroFunc.apply(sloroFunc, args);
        // Add slow state to the SlowAsyncFunctionActivation instance.
        safa._slow = {
            type: 'SlowAsyncFunctionActivation',
            asyncFunction: asyncFunction,
            state: safa.state,
            awaiting: Promise.resolve(),
            resolve: deferred.resolve,
            reject: deferred.reject
        };
        // Persist the SlowAsyncFunctionActivation's initial state to the database.
        storage.upsert(safa);
        // Run the SlowAsyncFunctionActivation instance to completion, and return the promise of completion.
        runToCompletion(safa);
        return deferred.promise;
    });
    // Add slow state to the SlowAsyncFunction instance.
    asyncFunction._slow = {
        type: 'SlowAsyncFunction',
        id: asyncFunctionId,
        stateMachineSource: stateMachineSource,
        originalSource: originalSource
    };
    // Ensure the SlowAsyncFunction definition has been persisted to storage.
    storage.upsert(asyncFunction);
    // Return the SlowAsyncFunction instance.
    return asyncFunction;
}
// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: 'SlowAsyncFunction',
    rehydrate: function (obj) {
        // TODO: this will also upsert the asyncFunction as a side-effect. Split out that functionality!! We just want to rehydrate it here, not upsert it too.
        return asyncPseudoKeyword(obj.originalSource);
    }
});
module.exports = asyncPseudoKeyword;
//# sourceMappingURL=asyncPseudoKeyword.js.map