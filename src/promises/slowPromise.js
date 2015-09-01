var assert = require('assert');
var _ = require('lodash');
var resolveFunction = require('./resolveFunction');
var rejectFunction = require('./rejectFunction');
var standardResolutionProcedure = require('./standardResolutionProcedure');
var storage = require('../storage/storage');
/** Sentinal value used for internal promise constructor calls. */
var INTERNAL = {};
/** Promises A+ compliant Promise implementation with persistence. */
var SlowPromise = (function () {
    /** Constructs a SlowPromise instance. */
    function SlowPromise(resolver) {
        // -------------- Private implementation details from here down --------------
        this._slow = {
            type: 10 /* SlowPromise */,
            isFateResolved: false,
            state: 0 /* Pending */,
            settledValue: void 0,
            handlers: []
        };
        // Validate arguments.
        assert(_.isFunction(resolver) || resolver == INTERNAL);
        // If this is an internal call, return the promise now.
        if (resolver === INTERNAL)
            return;
        // Persist to storage.
        storage.track(this);
        // Construct resolve and reject functions, and call the resolver with them.
        var resolve = resolveFunction.create(this);
        var reject = rejectFunction.create(this);
        try {
            resolver(resolve, reject);
        }
        catch (ex) {
            reject(ex);
        }
    }
    /** Returns a new SlowPromise instance that is already resolved with the given value. */
    SlowPromise.resolved = function (value) {
        var deferred = SlowPromise.deferred();
        deferred.resolve(value);
        return deferred.promise;
    };
    /** Returns a new SlowPromise instance that is already rejected with the given reason. */
    SlowPromise.rejected = function (reason) {
        var deferred = SlowPromise.deferred();
        deferred.reject(reason);
        return deferred.promise;
    };
    /** Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate. */
    SlowPromise.deferred = function () {
        // Get a new promise instance using the internal constructor.
        var promise = new SlowPromise(INTERNAL);
        // Persist the new promise to storage.
        storage.track(promise);
        //// TODO: temp testing... monitor when this instance gets GC'd.
        //notifyGC(promise);
        // Create the resolve and reject functions.
        var resolve = resolveFunction.create(promise);
        var reject = rejectFunction.create(promise);
        // All done. Return the 'deferred' instance.
        return { promise: promise, resolve: resolve, reject: reject };
    };
    // TODO: temp testing....
    SlowPromise.delay = function (ms) {
        return new SlowPromise(function (resolve) {
            // TODO: use SLOW event loop!!
            setTimeout(function () { return resolve(); }, ms);
        });
    };
    /**
     * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
     * Both callbacks have a single parameter , the fulfillment value or rejection reason.
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
     * If an error is thrown in the callback, the returned promise rejects with that error.
     *
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    SlowPromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        var deferred2 = SlowPromise.deferred();
        this._slow.handlers.push({ onFulfilled: onFulfilled, onRejected: onRejected, deferred2: deferred2 });
        storage.track(this);
        if (this._slow.state !== 0 /* Pending */)
            setTimeout(function () { return processAllHandlers(_this); }, 0);
        return deferred2.promise;
    };
    /**
     * Sugar for promise.then(undefined, onRejected)
     *
     * @param onRejected called when/if "promise" rejects
     */
    SlowPromise.prototype.catch = function (onRejected) {
        return this.then(void 0, onRejected);
    };
    SlowPromise.prototype._fulfil = function (value) {
        var _this = this;
        if (this._slow.state !== 0 /* Pending */)
            return;
        _a = [1 /* Fulfilled */, value], this._slow.state = _a[0], this._slow.settledValue = _a[1];
        storage.track(this);
        setTimeout(function () { return processAllHandlers(_this); }, 0);
        var _a;
    };
    SlowPromise.prototype._reject = function (reason) {
        var _this = this;
        if (this._slow.state !== 0 /* Pending */)
            return;
        _a = [2 /* Rejected */, reason], this._slow.state = _a[0], this._slow.settledValue = _a[1];
        storage.track(this);
        setTimeout(function () { return processAllHandlers(_this); }, 0);
        var _a;
    };
    return SlowPromise;
})();
/**
 * Dequeues and processes all enqueued onFulfilled/onRejected handlers.
 * The SlowPromise implementation calls this when `p` becomes settled,
 * and then on each `then` call made after `p` is settled.
 */
function processAllHandlers(p) {
    // Dequeue each onResolved/onRejected handler in order.
    while (p._slow.handlers.length > 0) {
        var handler = p._slow.handlers.shift();
        storage.track(p);
        // Fulfilled case.
        if (p._slow.state === 1 /* Fulfilled */) {
            if (_.isFunction(handler.onFulfilled)) {
                try {
                    var ret = handler.onFulfilled.apply(void 0, [p._slow.settledValue]);
                    standardResolutionProcedure(handler.deferred2.promise, ret);
                }
                catch (ex) {
                    handler.deferred2.reject(ex);
                }
            }
            else {
                handler.deferred2.resolve(p._slow.settledValue);
            }
        }
        else if (p._slow.state === 2 /* Rejected */) {
            if (_.isFunction(handler.onRejected)) {
                try {
                    var ret = handler.onRejected.apply(void 0, [p._slow.settledValue]);
                    standardResolutionProcedure(handler.deferred2.promise, ret);
                }
                catch (ex) {
                    handler.deferred2.reject(ex);
                }
            }
            else {
                handler.deferred2.reject(p._slow.settledValue);
            }
        }
    }
}
// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: 10 /* SlowPromise */,
    rehydrate: function (obj) {
        var promise = new SlowPromise(INTERNAL);
        promise._slow = obj;
        return promise;
    }
});
module.exports = SlowPromise;
//# sourceMappingURL=slowPromise.js.map