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
        this.$slow = {
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
//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowAsyncFunctionActivation,
//    dehydrate: (p: types.SlowAsyncFunction.Activation, recurse: (obj) => any) => {
//        if (!p || !p.$slow || p.$slow.type !== SlowType.SlowAsyncFunctionActivation) return;
//        var jsonSafeObject = _.mapValues(p.$slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => {
//        var safa: types.SlowAsyncFunction.Activation = <any> new Steppable(jsonSafeObject.asyncFunction.stateMachine);
//        safa.state = jsonSafeObject.state;
//        safa.$slow = jsonSafeObject;
//        safa.$slow.onAwaitedResult = makeContinuationResultHandler(safa);
//        safa.$slow.onAwaitedError = makeContinuationErrorHandler(safa);
//        // TODO: and continue running it...
//        //assert(safa.$slow.awaiting); // should only ever be rehydrating from an awaiting state
//        //safa.$slow.awaiting.then(safa.$slow.onAwaitedResult, safa.$slow.onAwaitedError);
//        // All done.
//        return safa;
//    }
//});
//# sourceMappingURL=slowAsyncFunctionActivation.js.map