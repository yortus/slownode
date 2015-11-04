var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var assert = require('assert');
var SteppableObject = require('../steppables/steppableObject');
var SlowClosure = require('../closures/slowClosure');
/**
 * A SlowAsyncFunctionActivation is a 'slow' extension of SteppableObject.
 * Instances of SlowAsyncFunctionActivation are used internally to manage
 * calls to SlowAsyncFunction instances.
 */
var SlowAsyncFunctionActivation = (function (_super) {
    __extends(SlowAsyncFunctionActivation, _super);
    /** Create a new SlowAsyncFunctionActivation instance. */
    function SlowAsyncFunctionActivation(epochLog, asyncFunction, resolve, reject, args) {
        _super.call(this, asyncFunction.stateMachine);
        this.epochLog = epochLog;
        this.state = { local: { arguments: args } };
        var safa = this;
        this.$slow = {
            kind: 30 /* AsyncFunctionActivation */,
            id: null,
            asyncFunction: asyncFunction,
            state: this.state,
            awaiting: null,
            resumeNext: SlowClosure.forEpoch(epochLog)({ safa: safa }, function (value) { safa.runToCompletion(null, value); }),
            resumeError: SlowClosure.forEpoch(epochLog)({ safa: safa }, function (error) { safa.runToCompletion(error); }),
            resolve: resolve,
            reject: reject
        };
        // Synchronise with the persistent object graph.
        epochLog.created(this); // TODO: temp testing...
    }
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
    SlowAsyncFunctionActivation.prototype.runToCompletion = function (error, next) {
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
            if (error)
                s.reject(error);
            else
                s.resolve(yielded.value);
            // Synchronise with the persistent object graph.
            // TODO: temp testing...
            this.epochLog.deleted(s.resolve);
            this.epochLog.deleted(s.reject);
            this.epochLog.deleted(s.resumeNext);
            this.epochLog.deleted(s.resumeError);
            this.epochLog.deleted(this);
            return;
        }
        // The Steppable yielded. Ensure the yielded value is awaitable.
        // TODO: review awaitability checks, supported values/types, and error handling
        var awaiting = this.$slow.awaiting = yielded.value;
        assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');
        // Attach fulfilled/rejected handlers to the awaitable, which resume the steppable.
        awaiting.then(this.$slow.resumeNext, this.$slow.resumeError);
        // Synchronise with the persistent object graph.
        // TODO: temp testing...
        this.epochLog.updated(this);
    };
    return SlowAsyncFunctionActivation;
})(SteppableObject);
module.exports = SlowAsyncFunctionActivation;
//# sourceMappingURL=slowAsyncFunctionActivation.js.map