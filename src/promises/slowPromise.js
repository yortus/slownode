var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var assert = require('assert');
var _ = require('lodash');
var SlowPromiseResolve = require('./slowPromiseResolve');
var SlowPromiseReject = require('./slowPromiseReject');
var standardResolutionProcedure = require('./standardResolutionProcedure');
var slowTimers = require('../eventLoop/slowTimers');
// TODO: add all(), race()... (see https://github.com/borisyankov/DefinitelyTyped/blob/master/es6-promise/es6-promise.d.ts)
/**
 * Promises A+ compliant slow promise implementation.
 */
var SlowPromise = (function () {
    /**
     * Constructs a SlowPromise instance.
     */
    function SlowPromise(resolver) {
        /**
         * INTERNAL holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data.
         */
        this.$slow = {
            kind: 10 /* Promise */,
            id: null,
            state: 0 /* Pending */,
            settledValue: void 0,
            handlers: []
        };
        // Validate arguments.
        assert(!resolver || _.isFunction(resolver));
        // Synchronise with the persistent object graph.
        this.constructor.epochLog.created(this); // TODO: temp testing...
        // If no resolver was given, just return now. This is an internal use of the constructor.
        if (!resolver)
            return this;
        // Construct resolve and reject functions to be passed to the resolver.
        var resolve = new SlowPromiseResolve(this);
        var reject = new SlowPromiseReject(this);
        // Call the given resolver. This kicks off the asynchronous operation whose outcome the Promise represents.
        try {
            resolver(resolve, reject);
        }
        catch (ex) {
            reject(ex);
        }
    }
    /**
     * Returns a new SlowPromise instance that is already resolved with the given value.
     */
    SlowPromise.resolved = function (value) {
        var promise = new this(null);
        var resolve = new SlowPromiseResolve(promise);
        resolve(value);
        return promise;
    };
    ;
    /**
     * Returns a new SlowPromise instance that is already rejected with the given reason.
     */
    SlowPromise.rejected = function (reason) {
        var promise = new this(null);
        var reject = new SlowPromiseReject(promise);
        reject(reason);
        return promise;
    };
    ;
    /**
     * Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate.
     */
    SlowPromise.deferred = function () {
        var promise = new this(null);
        var resolve = new SlowPromiseResolve(promise);
        var reject = new SlowPromiseReject(promise);
        return { promise: promise, resolve: resolve, reject: reject };
    };
    ;
    /**
     * Returns a new SlowPromise instance that resolves after `ms` milliseconds.
     */
    SlowPromise.delay = function (ms) {
        var _this = this;
        return new this(function (resolve) {
            // TODO: temp testing...
            slowTimers.setTimeout.forEpoch(_this.epochLog)(function (resolve) { return resolve(); }, ms, resolve);
            // TODO: temp testing...
            //setTimeout(resolve => resolve(), ms, resolve);
            // TODO: was... fix!!!
            //slowEventLoop.setTimeout(resolve => resolve(), ms, resolve); // TODO: need log-bound slowEventLoop
        });
    };
    ;
    /**
     * TODO: INTERNAL...
     */
    SlowPromise.forEpoch = function (epochLog) {
        var Subclass = (function (_super) {
            __extends(SlowPromise, _super);
            function SlowPromise(resolver) {
                _super.call(this, resolver);
            }
            SlowPromise.epochLog = epochLog;
            return SlowPromise;
        })(this);
        // TODO: force-bind static props so they work when called as free functions
        for (var staticProperty in Subclass) {
            if (!Subclass.hasOwnProperty(staticProperty))
                continue;
            if (typeof Subclass[staticProperty] !== 'function')
                continue;
            Subclass[staticProperty] = Subclass[staticProperty].bind(Subclass);
        }
        return Subclass;
    };
    /**
     * onFulfilled is called when the promise resolves. onRejected is called when the promise rejects.
     * Both callbacks have a single parameter , the fulfillment value or rejection reason.
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    SlowPromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        // Create the new promise to be returned by this .then() call.
        var deferred2 = this.constructor.deferred();
        this.$slow.handlers.push({ onFulfilled: onFulfilled, onRejected: onRejected, deferred2: deferred2 });
        // Synchronise with the persistent object graph.
        this.constructor.epochLog.updated(this); // TODO: temp testing...
        // If the promise is already settled, invoke the given handlers now (asynchronously).
        if (this.$slow.state !== 0 /* Pending */)
            process.nextTick(function () { return processAllHandlers(_this); });
        // Return the chained promise.
        return deferred2.promise;
    };
    /**
     * Sugar for promise.then(undefined, onRejected)
     * @param onRejected called when/if "promise" rejects
     */
    SlowPromise.prototype.catch = function (onRejected) {
        return this.then(void 0, onRejected);
    };
    /**
     * INTERNAL fulfils the promise.
     */
    SlowPromise.prototype.fulfil = function (value) {
        var _this = this;
        // Update the promise state.
        if (this.$slow.state !== 0 /* Pending */)
            return;
        _a = [1 /* Fulfilled */, value], this.$slow.state = _a[0], this.$slow.settledValue = _a[1];
        // Synchronise with the persistent object graph.
        this.constructor.epochLog.updated(this); // TODO: temp testing...
        // Invoke any already-attached handlers now (asynchronously).
        process.nextTick(function () { return processAllHandlers(_this); });
        var _a;
    };
    /**
     * INTERNAL rejects the promise.
     */
    SlowPromise.prototype.reject = function (reason) {
        var _this = this;
        // Update the promise state.
        if (this.$slow.state !== 0 /* Pending */)
            return;
        _a = [2 /* Rejected */, reason], this.$slow.state = _a[0], this.$slow.settledValue = _a[1];
        // Synchronise with the persistent object graph.
        this.constructor.epochLog.updated(this); // TODO: temp testing...
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
    while (p.$slow.handlers.length > 0) {
        var handler = p.$slow.handlers.shift();
        // Synchronise with the persistent object graph.
        p.constructor.epochLog.updated(p); // TODO: temp testing...
        // Fulfilled case.
        if (p.$slow.state === 1 /* Fulfilled */) {
            if (_.isFunction(handler.onFulfilled)) {
                try {
                    var ret = handler.onFulfilled.apply(void 0, [p.$slow.settledValue]);
                    standardResolutionProcedure(handler.deferred2.promise, ret);
                }
                catch (ex) {
                    handler.deferred2.reject(ex);
                }
            }
            else {
                handler.deferred2.resolve(p.$slow.settledValue);
            }
        }
        else if (p.$slow.state === 2 /* Rejected */) {
            if (_.isFunction(handler.onRejected)) {
                try {
                    var ret = handler.onRejected.apply(void 0, [p.$slow.settledValue]);
                    standardResolutionProcedure(handler.deferred2.promise, ret);
                }
                catch (ex) {
                    handler.deferred2.reject(ex);
                }
            }
            else {
                handler.deferred2.reject(p.$slow.settledValue);
            }
        }
    }
}
module.exports = SlowPromise;
//# sourceMappingURL=slowPromise.js.map