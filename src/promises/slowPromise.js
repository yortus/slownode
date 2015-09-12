var assert = require('assert');
var _ = require('lodash');
var SlowPromiseResolveFunction = require('./resolveFunction');
var SlowPromiseRejectFunction = require('./rejectFunction');
var standardResolutionProcedure = require('./standardResolutionProcedure');
var storage = require('../storage/storage');
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
        assert(!resolver || _.isFunction(resolver));
        // Synchronise with the persistent object graph.
        storage.created(this);
        // If no resolver was given, just return now. This is an internal use of the constructor.
        if (!resolver)
            return this;
        // Construct resolve and reject functions to be passed to the resolver.
        var resolve = new SlowPromiseResolveFunction(this);
        var reject = new SlowPromiseRejectFunction(this);
        // TODO: temp testing... why async? I think that's not in line with the draft PromisesAPlus constructor standard.
        setImmediate(function () {
            // TODO: Ensure the persistent object graph is safely stored before potentially yielding to the event loop
            storage.saveState();
            // Call the given resolver. This kicks off the asynchronous operation whose outcome the Promise represents.
            try {
                resolver(resolve, reject);
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
    /** Returns a new SlowPromise instance that is already resolved with the given value. */
    SlowPromise.resolved = function (value) {
        var promise = new SlowPromise(null);
        var resolve = new SlowPromiseResolveFunction(promise);
        resolve(value);
        return promise;
    };
    /** Returns a new SlowPromise instance that is already rejected with the given reason. */
    SlowPromise.rejected = function (reason) {
        var promise = new SlowPromise(null);
        var reject = new SlowPromiseRejectFunction(promise);
        reject(reason);
        return promise;
    };
    /** Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate. */
    SlowPromise.deferred = function () {
        var promise = new SlowPromise(null);
        var resolve = new SlowPromiseResolveFunction(promise);
        var reject = new SlowPromiseRejectFunction(promise);
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
     * onFulfilled is called when the promise resolves. onRejected is called when the promise rejects.
     * Both callbacks have a single parameter , the fulfillment value or rejection reason.
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
     * If an error is thrown in the callback, the returned promise rejects with that error.
     *
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    SlowPromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        // Create the new promise to be returned by this .then() call.
        var deferred2 = SlowPromise.deferred();
        this._slow.handlers.push({ onFulfilled: onFulfilled, onRejected: onRejected, deferred2: deferred2 });
        // Synchronise with the persistent object graph.
        storage.updated(this);
        // If the promise is already settled, invoke the given handlers now (asynchronously).
        if (this._slow.state !== 0 /* Pending */)
            process.nextTick(function () { return processAllHandlers(_this); });
        // Return the chained promise.
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
        // Update the promise state.
        if (this._slow.state !== 0 /* Pending */)
            return;
        _a = [1 /* Fulfilled */, value], this._slow.state = _a[0], this._slow.settledValue = _a[1];
        // Synchronise with the persistent object graph.
        storage.updated(this);
        // Invoke any already-attached handlers now (asynchronously).
        process.nextTick(function () { return processAllHandlers(_this); });
        var _a;
    };
    SlowPromise.prototype._reject = function (reason) {
        var _this = this;
        // Update the promise state.
        if (this._slow.state !== 0 /* Pending */)
            return;
        _a = [2 /* Rejected */, reason], this._slow.state = _a[0], this._slow.settledValue = _a[1];
        // Synchronise with the persistent object graph.
        storage.updated(this);
        // Invoke any already-attached handlers now (asynchronously).
        process.nextTick(function () { return processAllHandlers(_this); });
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
        // Synchronise with the persistent object graph.
        storage.updated(p);
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
module.exports = SlowPromise;
//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowPromise,
//    dehydrate: (p: types.SlowPromise, recurse: (obj) => any) => {
//        if (!p || !p._slow || p._slow.type !== SlowType.SlowPromise) return;
//        var jsonSafeObject = _.mapValues(p._slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => {
//        var promise = new SlowPromise(INTERNAL);
//        promise._slow = jsonSafeObject;
//        return promise;
//    }
//});
//# sourceMappingURL=slowPromise.js.map