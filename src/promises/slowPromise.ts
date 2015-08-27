import assert = require('assert');
import _ = require('lodash');
import types = require('types');
import State = types.SlowPromise.State;
import resolveFunction = require('./resolveFunction');
import rejectFunction = require('./rejectFunction');
import standardResolutionProcedure = require('./standardResolutionProcedure');
import storage = require('../storage/storage');
export = SlowPromise;


/** Sentinal value used for internal promise constructor calls. */
const DEFER: any = {};


/** Promises A+ compliant Promise implementation with persistence. */
class SlowPromise implements types.SlowPromise {

    /** Constructs a SlowPromise instance. May be called with or without new. */
    constructor(resolver: (resolve: (value?: any) => void, reject: (reason?: any) => void) => void) {

        // Validate arguments.
        assert(_.isFunction(resolver) || resolver == DEFER);

        // Persist to storage.
        storage.upsert(this);

        // If this is an internal call from makeDeferred(), return the promise now.
        if (resolver === DEFER) return this;

        // Otherwise, construct a deferred promise, then call the given resolver with the resolve and reject functions.
        var deferred = SlowPromise.deferred();
        try { resolver(deferred.resolve, deferred.reject); } catch (ex) { deferred.reject(ex); }
        return deferred.promise;
    }

    /** Returns a new SlowPromise instance that is already resolved with the given value. */
    static resolved(value: any) {
        var deferred = SlowPromise.deferred();
        deferred.resolve(value);
        return deferred.promise;
    }

    /** Returns a new SlowPromise instance that is already rejected with the given reason. */
    static rejected(reason: any) {
        var deferred = SlowPromise.deferred();
        deferred.reject(reason);
        return deferred.promise;
    }

    /** Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate. */
    static deferred() {

        // Get a new promise instance using the internal constructor.
        var promise = new SlowPromise(DEFER);

        //// TODO: temp testing... monitor when this instance gets GC'd.
        //notifyGC(promise);

        // Create the resolve and reject functions.
        var resolve = resolveFunction.create(promise);
        var reject = rejectFunction.create(promise);

        // All done.
        return { promise, resolve, reject };
    }


    // TODO: temp testing....
    static delay(ms: number) {
        return new SlowPromise(resolve => {
            // TODO: use SLOW event loop!!
            setTimeout(() => resolve(), ms);
        });

    }


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
    then(onFulfilled?: (value) => any, onRejected?: (error) => any) {
        var deferred2 = SlowPromise.deferred();
        this._slow.handlers.push({ onFulfilled, onRejected, deferred2 });
        storage.upsert(this);
        if (this._slow.state !== State.Pending) setTimeout(() => processAllHandlers(this), 0);
        return deferred2.promise;
    }

    /**
     * Sugar for promise.then(undefined, onRejected)
     *
     * @param onRejected called when/if "promise" rejects
     */
    catch(onRejected?: (error) => any) {
        return this.then(void 0, onRejected);
    }

    // -------------- Private implementation details from here down --------------
    _slow = {
        type: 'SlowPromise',
        isFateResolved: false,
        state: State.Pending,
        settledValue: void 0,
        handlers: <Array<{
            onFulfilled: (value) => any,
            onRejected: (reason) => any,
            deferred2: types.SlowPromise.Deferred
        }>> []
    };

    _fulfil(value: any) {
        if (this._slow.state !== State.Pending) return;
        [this._slow.state, this._slow.settledValue] = [State.Fulfilled, value];
        storage.upsert(this);
        setTimeout(() => processAllHandlers(this), 0);
    }

    _reject(reason: any) {
        if (this._slow.state !== State.Pending) return;
        [this._slow.state, this._slow.settledValue] = [State.Rejected, reason];
        storage.upsert(this);
        setTimeout(() => processAllHandlers(this), 0);
    }
}


/** Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate. */
function makeDeferred() {
}


/**
 * Dequeues and processes all enqueued onFulfilled/onRejected handlers.
 * The SlowPromise implementation calls this when `p` becomes settled,
 * and then on each `then` call made after `p` is settled.
 */
function processAllHandlers(p: SlowPromise) {

    // Dequeue each onResolved/onRejected handler in order.
    while (p._slow.handlers.length > 0) {
        var handler = p._slow.handlers.shift();
        storage.upsert(p);

        // Fulfilled case.
        if (p._slow.state === State.Fulfilled) {
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

        // Rejected case.
        else if (p._slow.state === State.Rejected) {
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