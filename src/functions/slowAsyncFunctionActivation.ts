import assert = require('assert');
import path = require('path');
import SlowKind = require('../slowKind');
import SlowObject = require('../slowObject');
import persistence = require('../persistence');
import SlowPromise = require('../promises/slowPromise');
import SlowPromiseResolve = require('../promises/slowPromiseResolve');
import SlowPromiseReject = require('../promises/slowPromiseReject');
import SteppableStateMachine = require('../steppables/steppableStateMachine');
import SteppableObject = require('../steppables/steppableObject');
import SlowClosure = require('./slowClosure');
import SlowAsyncFunction = require('./slowAsyncFunction'); // NB: elided circular ref (for types only)
export = SlowAsyncFunctionActivation;


/**
 * A SlowAsyncFunctionActivation is a 'slow' extension of SteppableObject.
 * Instances of SlowAsyncFunctionActivation are used internally to manage
 * calls to SlowAsyncFunction instances.
 */
class SlowAsyncFunctionActivation extends SteppableObject {

    /** Create a new SlowAsyncFunctionActivation instance. */
    constructor(private epochId: string, asyncFunction: SlowAsyncFunction, resolve: SlowPromiseResolve, reject: SlowPromiseReject, args: any[]) {
        super(asyncFunction.stateMachine);
        this.state = { local: { arguments: args } };

        var safa = this;
        this.$slow = {
            kind: SlowKind.AsyncFunctionActivation,
            epochId: epochId,
            id: null,
            asyncFunction: asyncFunction,
            state: this.state,
            awaiting: null,
            resumeNext: SlowClosure.forEpoch(epochId)({safa}, value => { safa.runToCompletion(null, value); }),
            resumeError: SlowClosure.forEpoch(epochId)({safa}, error => { safa.runToCompletion(error); }),
            resolve: resolve,
            reject: reject
        };

        // Synchronise with the persistent object graph.
        persistence.created(this); // TODO: temp testing...
    }

    /** Holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data. */
    $slow: {
        kind: SlowKind,
        epochId: string,
        id: string,

        /** The body of code being executed by this activation. */
        asyncFunction: SlowAsyncFunction,

        /** State of all locals at the current point of suspended execution. */
        state: SteppableStateMachine.State,

        /** The awaitable (ie slow promise) that must resolve before execution may resume. */
        awaiting: SlowPromise,

        /** Resumes execution with a value. */
        resumeNext: SlowObject & ((value) => void),

        /** Resumes execution with an error. */
        resumeError: SlowObject & ((error) => void),

        /** Signals that the activation returned a result. */
        resolve: SlowPromiseResolve,

        /** Signals that the activation threw an error. */
        reject: SlowPromiseReject
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
            error = null;
        }
        catch (ex) {
            error = ex;
        }

        // The Steppable returned or threw. Resolve/reject and finalise the SlowAsyncFunctionActivation.
        if (error || yielded.done) {

            var s = this.$slow;
            if (error) s.reject(error); else s.resolve(yielded.value);

            // Synchronise with the persistent object graph.
            // TODO: temp testing...
            persistence.deleted(s.resolve);
            persistence.deleted(s.reject);
            persistence.deleted(s.resumeNext);
            persistence.deleted(s.resumeError);
            persistence.deleted(this);
            return;
        }

        // The Steppable yielded. Ensure the yielded value is awaitable.
        // TODO: review awaitability checks, supported values/types, and error handling
        var awaiting: SlowPromise = this.$slow.awaiting = yielded.value;
        assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');

        // Attach fulfilled/rejected handlers to the awaitable, which resume the steppable.
        awaiting.then(this.$slow.resumeNext, this.$slow.resumeError);

        // Synchronise with the persistent object graph.
        // TODO: temp testing...
        persistence.updated(this);
    }
}
