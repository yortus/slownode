import assert = require('assert');
import path = require('path');
import SlowObject = require('../slowObject');
import SlowPromise = require('../promises/slowPromise');
import SlowPromiseResolve = require('../promises/slowPromiseResolve');
import SlowPromiseReject = require('../promises/slowPromiseReject');
import SlowType = require('../slowType');
import SteppableStateMachine = require('../steppables/steppableStateMachine');
import SteppableObject = require('../steppables/steppableObject');
import SlowClosure = require('../slowClosure');
import SlowAsyncFunction = require('./slowAsyncFunction'); // NB: elided circular ref (for types only)
import storage = require('../storage/storage');
export = SlowAsyncFunctionActivation;


/**
 * A SlowAsyncFunctionActivation is a 'slow' extension of SteppableObject.
 * Instances of SlowAsyncFunctionActivation are used internally to manage
 * calls to SlowAsyncFunction instances.
 */
class SlowAsyncFunctionActivation extends SteppableObject {

    /** Create a new SlowAsyncFunctionActivation instance. */
    constructor(asyncFunction: SlowAsyncFunction, resolve: SlowPromiseResolve, reject: SlowPromiseReject, args: any[]) {
        super(asyncFunction.stateMachine);
        this.state = this.$slow.state = { local: { arguments: args } };
        this.$slow.asyncFunction = asyncFunction;
        this.$slow.resolve = resolve;
        this.$slow.reject = reject;
        var safa = this;
        this.$slow.resumeNext = new SlowClosure({safa}, value => { safa.runToCompletion(null, value); }),
        this.$slow.resumeError = new SlowClosure({safa}, error => { safa.runToCompletion(error); }),
        storage.created(this);
    }

    /** Holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data. */
    $slow = {
        type: SlowType.SlowAsyncFunctionActivation,
        id: <string> null,

        /** The body of code being executed by this activation. */
        asyncFunction: <SlowAsyncFunction> null,

        /** State of all locals at the current point of suspended execution. */
        state: <SteppableStateMachine.State> null,

        /** The awaitable (ie slow promise) that must resolve before execution may resume. */
        awaiting: <SlowPromise> null,

        /** Resumes execution with a value. */
        resumeNext: <SlowObject & ((value) => void)> null,

        /** Resumes execution with an error. */
        resumeError: <SlowObject & ((error) => void)> null,

        /** Signals that the activation returned a result. */
        resolve: <SlowPromiseResolve> null,

        /** Signals that the activation threw an error. */
        reject: <SlowPromiseReject> null
    };

    /**
     * Runs the SlowAsyncFunctionActivation instance to completion. First, the activation (which
     * must be currently suspended) is resumed, either passing the given `next` value into it, or
     * throwing the given `error` value into it. If neither `error` or `next` is given, it is
     * resumed with 'undefined' as its next value.
     * If the activation returns or throws, then the activation's promise is settled accordingly.
     * If the activation yields, then it goes back into a suspended state. The yielded value must
     * be an awaitable value. A recursive call to runToCompletion() is scheduled for when the
     * awaitable value is settled. Thus an asynchronous 'loop' is executed until the activation
     * either returns or throws.
     */
    runToCompletion(error?: any, next?: any) {

        // Resume the underlying Steppable by either throwing into it or calling next(), depending on args.
        try {
            var yielded = error ? this.throw(error) : this.next(next);
        }

        // The Steppable threw. Finalize and reject the SlowAsyncFunctionActivation.
        catch (ex) {
            var s = this.$slow;
            s.reject(ex);

            // Synchronise with the persistent object graph.
            storage.deleted(s.resolve).deleted(s.reject).deleted(s.resumeNext).deleted(s.resumeError).deleted(this);
            return;
        }

        // The Steppable returned. Finalize and resolve the SlowAsyncFunctionActivation.
        if (yielded.done) {
            var s = this.$slow;
            s.resolve(yielded.value);

            // Synchronise with the persistent object graph.
            storage.deleted(s.resolve).deleted(s.reject).deleted(s.resumeNext).deleted(s.resumeError).deleted(this);
            return;
        }

        // The Steppable yielded. Ensure the yielded value is awaitable.
        // TODO: review awaitability checks, supported values/types, and error handling
        var awaiting: SlowPromise = this.$slow.awaiting = yielded.value;
        assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');

        // Attach fulfilled/rejected handlers to the awaitable, which resume the steppable.
        awaiting.then(this.$slow.resumeNext, this.$slow.resumeError);

        // Synchronise with the persistent object graph.
        storage.updated(this);
    }
}


// Tell storage how to create a SlowAsyncFunctionActivation instance.
storage.registerSlowObjectFactory(SlowType.SlowAsyncFunctionActivation, ($slow: any) => {

    // NB: The rehydration approach used here depends on two implementation details:
    // (1) the safa constructor doesn't care about the passed values for resolve/reject/args,
    //     so these can be fixed up after construction (by re-assigning the $slow property).
    // (2) the given $slow already has a valid `asyncFunction` property because that will
    //     always appear in the storage log before any activations which use it.
    var safa = new SlowAsyncFunctionActivation($slow.asyncFunction, null, null, null);
    safa.$slow = <any> $slow;
    safa.state = safa.$slow.state;
    return safa;
});
