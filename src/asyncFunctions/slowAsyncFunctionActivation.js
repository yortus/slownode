var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//import makeCallableClass = require('../util/makeCallableClass');
//import shasum = require('../util/shasum');
//import SteppableFunction = require('../functions/steppableFunction');
var SteppableObject = require('../functions/steppableObject');
//import SlowPromise = require('../promises/slowPromise');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
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
module.exports = SlowAsyncFunctionActivation;
//# sourceMappingURL=slowAsyncFunctionActivation.js.map