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
    function SlowAsyncFunctionActivation(asyncFunction, resolve, reject, args) {
        _super.call(this, asyncFunction.stateMachine);
        this.$slow = {
            type: 30 /* SlowAsyncFunctionActivation */,
            asyncFunction: null,
            state: null,
            awaiting: null,
            resumeNext: new SlowAsyncFunctionActivationResumeNext(this),
            resumeError: new SlowAsyncFunctionActivationResumeError(this),
            resolve: null,
            reject: null
        };
        this.state = this.$slow.state = { local: { arguments: args } };
        this.$slow.asyncFunction = asyncFunction;
        this.$slow.resolve = resolve;
        this.$slow.reject = reject;
        storage.created(this);
    }
    return SlowAsyncFunctionActivation;
})(SteppableObject);
// Tell storage how to create a SlowAsyncFunctionActivation instance.
storage.registerSlowObjectFactory(30 /* SlowAsyncFunctionActivation */, function ($slow) {
    // NB: The rehydration approach used here depends on two implementation details:
    // (1) the safa constructor doesn't care about the passed values for resolve/reject/args,
    //     so these can be fixed up after construction (by re-assigning the $slow property).
    // (2) the given $slow already has a valid `asyncFunction` property because that will
    //     always appear in the storage log before any activations using it.
    var safa = new SlowAsyncFunctionActivation($slow.asyncFunction, null, null, null);
    safa.$slow = $slow;
    safa.state = safa.$slow.state;
    return safa;
});
module.exports = SlowAsyncFunctionActivation;
//# sourceMappingURL=slowAsyncFunctionActivation.js.map