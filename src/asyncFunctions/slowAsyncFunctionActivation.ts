import types = require('types');
import SlowType = types.SlowObject.Type;
import SteppableObject = require('../functions/steppableObject');
import SlowAsyncFunctionActivationResumeNext = require('./slowAsyncFunctionActivationResumeNext');
import SlowAsyncFunctionActivationResumeError = require('./slowAsyncFunctionActivationResumeError');
import storage = require('../storage/storage');
export = SlowAsyncFunctionActivation;


/** A SlowAsyncFunctionActivation is a SteppableObject with additional properties. */
class SlowAsyncFunctionActivation extends SteppableObject implements types.SlowAsyncFunction.Activation {

    constructor(asyncFunction: types.SlowAsyncFunction, resolve: types.SlowPromise.Resolve, reject: types.SlowPromise.Reject, args: any[]) {
        super(asyncFunction.stateMachine);
        this.state = this.$slow.state = { local: { arguments: args } };
        this.$slow.asyncFunction = asyncFunction;
        this.$slow.resolve = resolve;
        this.$slow.reject = reject;
        storage.created(this);
    }

    $slow = {
        type: SlowType.SlowAsyncFunctionActivation,
        asyncFunction: null,
        state: null,
        awaiting: null,
        resumeNext: new SlowAsyncFunctionActivationResumeNext(this),
        resumeError: new SlowAsyncFunctionActivationResumeError(this),
        resolve: null,
        reject: null
    };
}


// Tell storage how to create a SlowAsyncFunctionActivation instance.
storage.registerSlowObjectFactory(SlowType.SlowAsyncFunctionActivation, ($slow: any) => {
    // NB: The rehydration approach used here depends on two implementation details:
    // (1) the safa constructor doesn't care about the passed values for resolve/reject/args,
    //     so these can be fixed up after construction (by re-assigning the $slow property).
    // (2) the given $slow already has a valid `asyncFunction` property because that will
    //     always appear in the storage log before any activations using it.
    var safa = new SlowAsyncFunctionActivation($slow.asyncFunction, null, null, null);
    safa.$slow = <any> $slow;
    safa.state = safa.$slow.state;
    return safa;
});
