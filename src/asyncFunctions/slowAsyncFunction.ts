import assert = require('assert');
import _ = require('lodash');
import types = require('types');
import SlowType = types.SlowObject.Type;
import makeCallableClass = require('../util/makeCallableClass');
import shasum = require('../util/shasum');
import SteppableFunction = require('../functions/steppableFunction');
import SteppableObject = require('../functions/steppableObject');
import SlowPromise = require('../promises/slowPromise');
import SlowAsyncFunctionActivation = require('./slowAsyncFunctionActivation');
import runToCompletion = require('./runToCompletion');
import storage = require('../storage/storage');
export = SlowAsyncFunction;



/** TODO: doc... */
var SlowAsyncFunction: types.SlowAsyncFunction = <any> makeCallableClass({

    constructor: function (bodyFunc: Function) {

        // Validate arguments.
        assert(typeof bodyFunc === 'function');

        // Get the shasum of the body function's source code. This is used
        // to uniquely identify the SlowAsyncFunction for caching purposes.
        var originalSource = bodyFunc.toString();
        var safid = shasum(originalSource);

        // Return the cached SlowAsyncFunction instance immediately if there is one.
        var cached = asyncFunctionCache[safid];
        if (cached) return cached;

        // Create a new SlowAsyncFunction instance.
        var steppableFunc = new SteppableFunction(bodyFunc, { pseudoYield: 'await', pseudoConst: '__const' });
        this.stateMachine = steppableFunc.stateMachine;
        this._slow = {
            type: SlowType.SlowAsyncFunction,
            id: safid,
            stateMachineSource: steppableFunc.stateMachine.toString(),
            originalSource
        };

        // Cache this SlowAsyncFunction instance to save re-computing it again.
        asyncFunctionCache[safid] = this;

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    call: function (...args): types.SlowAsyncFunction {

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
var asyncFunctionCache: { [afid: string]: types.SlowAsyncFunction; } = {};









// TODO: temp testing...
//function tween(stateMachineSource: string, originalSource: string) {
//    var stateMachine = eval('(' + stateMachineSource + ')');
//    var steppableFunc = SteppableFunction.fromStateMachine(stateMachine);
//    return makeSlowAsyncFunction(steppableFunc, stateMachineSource, originalSource);
//}
    
    
    










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
