import types = require('types');
import SlowType = types.SlowObject.Type;
import SteppableObject = require('../functions/steppableObject');
import SlowAsyncFunctionActivationResumeNext = require('./slowAsyncFunctionActivationResumeNext');
import SlowAsyncFunctionActivationResumeError = require('./slowAsyncFunctionActivationResumeError');
import storage = require('../storage/storage');
export = SlowAsyncFunctionActivation;


/** A SlowAsyncFunctionActivation is a SteppableObject with additional properties. */
class SlowAsyncFunctionActivation extends SteppableObject implements types.SlowAsyncFunction.Activation {

    constructor(stateMachine: types.Steppable.StateMachine, args: any[], private asyncFunction: types.SlowAsyncFunction, private deferred: types.SlowPromise.Deferred) {
        super(stateMachine);
        this.state = this.$slow.state = { local: { arguments: args } };
        storage.created(this);
    }

    $slow = {
        type: SlowType.SlowAsyncFunctionActivation,
        asyncFunction: this.asyncFunction,
        state: null,
        awaiting: null,
        resumeNext: new SlowAsyncFunctionActivationResumeNext(this),
        resumeError: new SlowAsyncFunctionActivationResumeError(this),
        resolve: this.deferred.resolve,
        reject: this.deferred.reject
    };
}


// Tell storage how to create a SlowAsyncFunctionActivation instance.
storage.registerSlowObjectFactory(SlowType.SlowAsyncFunctionActivation, $slow => {
    var safa = new SlowAsyncFunctionActivation(() => {}, [], null, <any> {});
    safa.$slow = <any> $slow;
    safa.state = safa.$slow.state;

    // TODO: temp testing...
    Object.defineProperty(safa, 'stateMachine', { get: () => safa.$slow.asyncFunction.stateMachine });

    return safa;
});
