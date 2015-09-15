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

