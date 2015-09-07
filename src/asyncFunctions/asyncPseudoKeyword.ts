import assert = require('assert');
import crypto = require('crypto');
import _ = require('lodash');
import types = require('types');
import SlowType = types.SlowObject.Type;
import Steppable = require('../functions/steppable');
import SteppableFunction = require('../functions/steppableFunction');
import SlowPromise = require('../promises/slowPromise');
import runToCompletion = require('./runToCompletion');
import storage = require('../storage/storage');
export = asyncPseudoKeyword;


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
var asyncPseudoKeyword: types.Async = <any> ((bodyFunc: Function) => {

    // Validate arguments.
    assert(typeof bodyFunc === 'function');

    // Get all inforation required to create the AsyncFunction instance, based on the given bodyFunc.
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
function tween(stateMachineSource: string, originalSource: string) {

    var stateMachine = eval('(' + stateMachineSource + ')');

    var steppableFunc: types.Steppable.Function = <any> ((...args) => {
        var steppable = new Steppable(stateMachine);
        steppable.state = { local: { arguments: args } };
        return steppable;
    });
    steppableFunc.stateMachine = stateMachine;

    return makeSlowAsyncFunction(steppableFunc, stateMachineSource, originalSource);
}










// TODO: doc...
function makeSlowAsyncFunction(steppableFunc: types.Steppable.Function, stateMachineSource: string, originalSource: string) {

    // TODO: ...
    var asyncFunctionId: string = crypto.createHash('sha1').update(stateMachineSource).digest('hex').slice(0, 40);

    // Create the callable part of the SlowAsyncFunction object. When called, this function creates a new
    // SlowAsyncFunctionActivation object from the given SteppableFunction, and runs it to completion.
    var asyncFunction: types.SlowAsyncFunction = <any> ((...args) => {

        // TODO: Create a new SlowPromise to represent the eventual result of the operation...
        var deferred = SlowPromise.deferred();

        // Create a new SlowAsyncFunctionActivation object using the given arguments.
        // A SlowAsyncFunctionActivation object is just a Steppable object with additional metadata.
        // TODO: subclass Steppable so we have a runtime-identifiable prototype?
        var safa: types.SlowAsyncFunction.Activation = steppableFunc.apply(steppableFunc, args);

        // Add slow state to the SlowAsyncFunctionActivation instance.
        safa._slow = {
            type: SlowType.SlowAsyncFunctionActivation,
            asyncFunction,
            state: safa.state,
            awaiting: null,
            onAwaitedResult: makeContinuationResultHandler(safa, true),
            onAwaitedError: makeContinuationErrorHandler(safa, true),
            resolve: deferred.resolve,
            reject: deferred.reject
        };

        // Persist the SlowAsyncFunctionActivation's initial state to storage.
        storage.track(safa);

        // Run the SlowAsyncFunctionActivation instance to completion, and return the promise of completion.
        runToCompletion(safa);
        return deferred.promise;
    });

    // Add a reference to the stateMachine to the SlowAsyncFunction.
    asyncFunction.stateMachine = steppableFunc.stateMachine;

    // Add slow state to the SlowAsyncFunction instance.
    asyncFunction._slow = {
        type: SlowType.SlowAsyncFunction,
        id: asyncFunctionId,
        stateMachineSource,
        originalSource
    };

    // Return the SlowAsyncFunction instance.
    return asyncFunction;
}


// TODO: doc...
function makeContinuationResultHandler(safa, persist: boolean) {
    var result: any = value => runToCompletion(safa, null, value);
    result._slow = { type: SlowType.SlowAsyncFunctionContinuationWithResult, safa };
    return result;
}
function makeContinuationErrorHandler(safa, persist: boolean) {
    var result: any = error => runToCompletion(safa, error);
    result._slow = { type: SlowType.SlowAsyncFunctionContinuationWithError, safa };
    return result;
}


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
