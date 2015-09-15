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
        this.state = { local: { arguments: args } };
        storage.created(this);
    }

    $slow = {
        type: SlowType.SlowAsyncFunctionActivation,
        asyncFunction: this.asyncFunction,
        state: this.state,
        awaiting: null,
        resumeNext: new SlowAsyncFunctionActivationResumeNext(this),
        resumeError: new SlowAsyncFunctionActivationResumeError(this),
        resolve: this.deferred.resolve,
        reject: this.deferred.reject
    };
}
