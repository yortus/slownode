var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SteppableObject = require('../functions/steppableObject');
var SlowAsyncFunctionActivationResumeNext = require('./slowAsyncFunctionActivationResumeNext');
var SlowAsyncFunctionActivationResumeError = require('./slowAsyncFunctionActivationResumeError');
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
            resumeNext: new SlowAsyncFunctionActivationResumeNext(this),
            resumeError: new SlowAsyncFunctionActivationResumeError(this),
            resolve: this.deferred.resolve,
            reject: this.deferred.reject
        };
        this.state = { local: { arguments: args } };
        storage.created(this);
    }
    return SlowAsyncFunctionActivation;
})(SteppableObject);
module.exports = SlowAsyncFunctionActivation;
//# sourceMappingURL=slowAsyncFunctionActivation.js.map