var assert = require('assert');
var _ = require('lodash');
var Types = require('slownode');
var storage = require('../storage/storage');
//// TODO: temp testing... node-weak/gc experiments. See ../index.ts for more info
//var weak = require('weak');
//function notifyGC(p: SlowPromise) {
//    var record = p._slow;
//    weak(p, function () {
//        console.log(`======== deleting: ${record.type}-${record.id}.json ========`);
//        storage.remove(record);
//    });
//}
/** Sentinal value used for internal promise constructor calls. */
var DEFER = {};
var SlowPromise = (function () {
    /** Constructs a SlowPromise instance. May be called with or without new. */
    function SlowPromise(resolver) {
        // -------------- Private implementation details from here down --------------
        this._slow = {
            type: 'SlowPromise',
            id: null,
            isFateResolved: false,
            state: 0 /* Pending */,
            settledValue: void 0,
            handlers: []
        };
        // Validate arguments.
        assert(_.isFunction(resolver) || resolver == DEFER);
        // Persist to storage.
        storage.insert(this._slow);
        // If this is an internal call from makeDeferred(), return the promise now.
        if (resolver === DEFER)
            return this;
        // Otherwise, construct a deferred promise, then call the given resolver with the resolve and reject functions.
        var deferred = makeDeferred();
        try {
            resolver(deferred.resolve, deferred.reject);
        }
        catch (ex) {
            deferred.reject(ex);
        }
        return deferred.promise;
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
        return makeDeferred();
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
        storage.update(this._slow);
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
        storage.update(this._slow);
        setTimeout(function () { return processAllHandlers(_this); }, 0);
        var _a;
    };
    SlowPromise.prototype._reject = function (reason) {
        var _this = this;
        if (this._slow.state !== 0 /* Pending */)
            return;
        _a = [2 /* Rejected */, reason], this._slow.state = _a[0], this._slow.settledValue = _a[1];
        storage.update(this._slow);
        setTimeout(function () { return processAllHandlers(_this); }, 0);
        var _a;
    };
    return SlowPromise;
})();
/** Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate. */
function makeDeferred() {
    // Get a new promise instance using the internal constructor.
    var promise = new SlowPromise(DEFER);
    //// TODO: temp testing...
    //notifyGC(promise);
    // Make the resolve function. It must be serializble.
    var resolve = (function (value) {
        if (promise._slow.isFateResolved)
            return;
        promise._slow.isFateResolved = true;
        storage.update(promise._slow);
        standardResolutionProcedure(promise, value);
    });
    resolve._slow = { type: 'SlowPromiseResolveFunction', id: promise._slow.id };
    // Make the reject function. It must be serializble.
    var reject = (function (reason) {
        if (promise._slow.isFateResolved)
            return;
        promise._slow.isFateResolved = true;
        storage.update(promise._slow);
        promise._reject(reason);
    });
    reject._slow = { type: 'SlowPromiseRejectFunction', id: promise._slow.id };
    // All done.
    return { promise: promise, resolve: resolve, reject: reject };
}
/** The SlowPromise constructor function cast to the full SlowPromise generic type defined in the .d.ts. */
var slowPromiseConstructorFunction = SlowPromise;
/**
 * Dequeues and processes all enqueued onFulfilled/onRejected handlers.
 * The SlowPromise implementation calls this when `p` is settled, and
 * on each `then` call made after `p` is settled.
 */
function processAllHandlers(p) {
    // Dequeue each onResolved/onRejected handler in order.
    while (p._slow.handlers.length > 0) {
        var handler = p._slow.handlers.shift();
        storage.update(p._slow);
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
/**
 * This is a transliteration of the [[Resolve]](promise, x) pseudocode in the Promises A+ Spec.
 * See: https://github.com/promises-aplus/promises-spec
 */
function standardResolutionProcedure(p, x) {
    if (x === p) {
        p._reject(new TypeError("slownode: cannot resolve promise with itself"));
    }
    else if (_.isObject(x) || _.isFunction(x)) {
        try {
            var then = x.then;
        }
        catch (ex) {
            p._reject(ex);
            return;
        }
        if (_.isFunction(then)) {
            var ignoreFurtherCalls = false;
            try {
                then.apply(x, [
                    function resolvePromise(y) {
                        if (ignoreFurtherCalls)
                            return;
                        ignoreFurtherCalls = true;
                        standardResolutionProcedure(p, y);
                    },
                    function rejectPromise(r) {
                        if (ignoreFurtherCalls)
                            return;
                        ignoreFurtherCalls = true;
                        p._reject(r);
                    },
                ]);
            }
            catch (ex) {
                if (ignoreFurtherCalls)
                    return;
                p._reject(ex);
            }
        }
        else {
            p._fulfil(x);
        }
    }
    else {
        p._fulfil(x);
    }
}
module.exports = slowPromiseConstructorFunction;
//# sourceMappingURL=slowPromise.js.map