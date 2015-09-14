//import assert = require('assert');
//import _ = require('lodash');
import types = require('types');
import SlowType = types.SlowObject.Type;
//import makeCallableClass = require('../util/makeCallableClass');
//import shasum = require('../util/shasum');
//import SteppableFunction = require('../functions/steppableFunction');
import SteppableObject = require('../functions/steppableObject');
//import SlowPromise = require('../promises/slowPromise');
import runToCompletion = require('./runToCompletion');
import storage = require('../storage/storage');
export = SlowAsyncFunctionActivation;


/** A SlowAsyncFunctionActivation is a SteppableObject with additional properties. */
class SlowAsyncFunctionActivation extends SteppableObject implements types.SlowAsyncFunction.Activation {

    constructor(stateMachine: types.Steppable.StateMachine, args: any[], private asyncFunction: types.SlowAsyncFunction, private deferred: types.SlowPromise.Deferred) {
        super(stateMachine);
        this.state = { local: { arguments: args } };

        // Synchronise with the persistent object graph.
        storage.created(this);
    }

    _slow = {
        type: SlowType.SlowAsyncFunctionActivation,
        asyncFunction: this.asyncFunction,
        state: this.state,
        awaiting: null,
        onAwaitedResult: makeContinuationResultHandler(this),
        onAwaitedError: makeContinuationErrorHandler(this),
        resolve: this.deferred.resolve,
        reject: this.deferred.reject
    };
}


// TODO: doc...
function makeContinuationResultHandler(safa: types.SlowAsyncFunction.Activation) {

    // Make a function that resumes the given activation with a 'next' value.
    var continuation: any = value => runToCompletion(safa, null, value);

    // Add slow metadata to the continuation function.
    continuation._slow = { type: SlowType.SlowAsyncFunctionContinuationWithResult, safa };

    // Synchronise with the persistent object graph.
    storage.created(continuation);

    // Return the continuation.
    return continuation;
}


// TODO: doc...
function makeContinuationErrorHandler(safa: types.SlowAsyncFunction.Activation) {

    // Make a function that resumes the given activation, throwing the given error into it.
    var continuation: any = error => runToCompletion(safa, error);

    // Add slow metadata to the continuation function.
    continuation._slow = { type: SlowType.SlowAsyncFunctionContinuationWithError, safa };

    // Synchronise with the persistent object graph.
    storage.created(continuation);

    // Return the continuation.
    return continuation;
}
