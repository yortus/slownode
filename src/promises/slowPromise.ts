import assert = require('assert');
import _ = require('lodash');
import EpochLog = require('../epochLog');
import SlowKind = require('../slowKind');
import SlowPromiseResolve = require('./slowPromiseResolve');
import SlowPromiseReject = require('./slowPromiseReject');
import standardResolutionProcedure = require('./standardResolutionProcedure');
import slowTimers = require('../eventLoop/slowTimers');
export = SlowPromise;


// TODO: add all(), race()... (see https://github.com/borisyankov/DefinitelyTyped/blob/master/es6-promise/es6-promise.d.ts)


/**
 * Promises A+ compliant slow promise implementation.
 */
class SlowPromise {

    /**
     * Constructs a SlowPromise instance.
     */
    constructor(resolver: (resolve: SlowPromiseResolve, reject: SlowPromiseReject) => void) {

        // Validate arguments.
        assert(!resolver || _.isFunction(resolver));

        // Synchronise with the persistent object graph.
        (<typeof SlowPromise> this.constructor).epochLog.created(this); // TODO: temp testing...

        // If no resolver was given, just return now. This is an internal use of the constructor.
        if (!resolver) return this;

        // Construct resolve and reject functions to be passed to the resolver.
        var resolve = new SlowPromiseResolve(this);
        var reject = new SlowPromiseReject(this);

        // Call the given resolver. This kicks off the asynchronous operation whose outcome the Promise represents.
        try { resolver(resolve, reject); } catch (ex) { reject(ex); }
    }

    /**
     * Returns a new SlowPromise instance that is already resolved with the given value.
     */
    static resolved(value?: any) {
        var promise = new this(null);
        var resolve = new SlowPromiseResolve(promise);
        resolve(value);
        return promise;
    };

    /**
     * Returns a new SlowPromise instance that is already rejected with the given reason.
     */
    static rejected(reason: any) {
        var promise = new this(null);
        var reject = new SlowPromiseReject(promise);
        reject(reason);
        return promise;
    };

    /**
     * Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate.
     */
    static deferred() {
        var promise = new this(null);
        var resolve = new SlowPromiseResolve(promise);
        var reject = new SlowPromiseReject(promise);
        return { promise, resolve, reject };
    };

    /**
     * Returns a new SlowPromise instance that resolves after `ms` milliseconds.
     */
    static delay(ms: number) {
        return new this(resolve => {

            // TODO: temp testing...
            slowTimers.setTimeout.forEpoch(this.epochLog)(resolve => resolve(), ms, resolve);



            // TODO: temp testing...
            //setTimeout(resolve => resolve(), ms, resolve);

            // TODO: was... fix!!!
            //slowEventLoop.setTimeout(resolve => resolve(), ms, resolve); // TODO: need log-bound slowEventLoop
        });
    };

    /**
     * TODO: INTERNAL...
     */
    static forEpoch(epochLog: EpochLog): typeof SlowPromise {

        // TODO: caching...
        cache = cache || <any> new Map();
        if (cache.has(epochLog)) return cache.get(epochLog);

        var Subclass = class SlowPromise extends this {
            constructor(resolver) {
                super(resolver);
            }
            static epochLog = epochLog;
        };

        // TODO: force-bind static props so they work when called as free functions
        for (var staticProperty in Subclass) {
            if (!Subclass.hasOwnProperty(staticProperty)) continue;
            if (typeof Subclass[staticProperty] !== 'function') continue;
            Subclass[staticProperty] = Subclass[staticProperty].bind(Subclass);
        }

        // TODO: caching...
        cache.set(epochLog, Subclass);
        return Subclass;
    }

    /**
     * TODO: INTERNAL...
     */
    static epochLog: EpochLog;

	/**
     * onFulfilled is called when the promise resolves. onRejected is called when the promise rejects.
     * Both callbacks have a single parameter , the fulfillment value or rejection reason.
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    then(onFulfilled?: (value) => any, onRejected?: (error) => any) {

        // Create the new promise to be returned by this .then() call.
        var deferred2 = (<typeof SlowPromise> this.constructor).deferred();
        this.$slow.handlers.push({ onFulfilled, onRejected, deferred2 });

        // Synchronise with the persistent object graph.
        (<typeof SlowPromise> this.constructor).epochLog.updated(this); // TODO: temp testing...

        // If the promise is already settled, invoke the given handlers now (asynchronously).
        if (this.$slow.state !== State.Pending) process.nextTick(() => processAllHandlers(this));

        // Return the chained promise.
        return deferred2.promise;
    }

    /**
     * Sugar for promise.then(undefined, onRejected)
     * @param onRejected called when/if "promise" rejects
     */
    catch(onRejected?: (error) => any) {
        return this.then(void 0, onRejected);
    }

    /**
     * INTERNAL holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data. 
     */
    $slow = {
        kind: SlowKind.Promise,
        id: <string> null,
        state: State.Pending,
        settledValue: void 0,
        handlers: <Array<{
            onFulfilled: (value) => any,
            onRejected: (reason) => any,
            deferred2: Deferred
        }>> []
    };

    /**
     * INTERNAL fulfils the promise.
     */
    fulfil(value: any) {

        // Update the promise state.
        if (this.$slow.state !== State.Pending) return;
        [this.$slow.state, this.$slow.settledValue] = [State.Fulfilled, value];

        // Synchronise with the persistent object graph.
        (<typeof SlowPromise> this.constructor).epochLog.updated(this); // TODO: temp testing...

        // Invoke any already-attached handlers now (asynchronously).
        process.nextTick(() => processAllHandlers(this));
    }

    /**
     * INTERNAL rejects the promise.
     */
    reject(reason: any) {

        // Update the promise state.
        if (this.$slow.state !== State.Pending) return;
        [this.$slow.state, this.$slow.settledValue] = [State.Rejected, reason];

        // Synchronise with the persistent object graph.
        (<typeof SlowPromise> this.constructor).epochLog.updated(this); // TODO: temp testing...

        // Invoke any already-attached handlers now (asynchronously).
        process.nextTick(() => processAllHandlers(this));
    }
}


/**
 * Dequeues and processes all enqueued onFulfilled/onRejected handlers.
 * The SlowPromise implementation calls this when `p` becomes settled,
 * and then on each `then` call made after `p` is settled.
 */
function processAllHandlers(p: SlowPromise) {

    // Dequeue each onResolved/onRejected handler in order.
    while (p.$slow.handlers.length > 0) {
        var handler = p.$slow.handlers.shift();

        // Synchronise with the persistent object graph.
        (<typeof SlowPromise> p.constructor).epochLog.updated(p); // TODO: temp testing...

        // Fulfilled case.
        if (p.$slow.state === State.Fulfilled) {
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

        // Rejected case.
        else if (p.$slow.state === State.Rejected) {
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


/**
 * The states that may be assumed by a SlowPromise instance.
 */
const enum State {
    Pending,
    Fulfilled,
    Rejected
}


/**
 * The type of object returned by the SlowPromise.deferred static method.
 */
interface Deferred {
    promise: SlowPromise;
    resolve: SlowPromiseResolve;
    reject: SlowPromiseReject;
}


// TODO: ...
var cache: Map<EpochLog, typeof SlowPromise>;
