import assert = require('assert');
import _ = require('lodash');
import types = require('types');
import State = types.SlowPromise.State;
import SlowType = types.SlowObject.Type;
import SlowPromiseResolveFunction = require('./resolveFunction');
import SlowPromiseRejectFunction = require('./rejectFunction');
import standardResolutionProcedure = require('./standardResolutionProcedure');
import storage = require('../storage/storage');
export = SlowPromise;


/** Promises A+ compliant Promise implementation with persistence. */
class SlowPromise implements types.SlowPromise {

    /** Constructs a SlowPromise instance. */
    constructor(resolver: (resolve: (value?: any) => void, reject: (reason?: any) => void) => void) {

        // Validate arguments.
        assert(!resolver || _.isFunction(resolver));

        // Synchronise with the persistent object graph.
        storage.created(this);

        // If no resolver was given, just return now. This is an internal use of the constructor.
        if (!resolver) return this;

        // Construct resolve and reject functions to be passed to the resolver.
        var resolve = new SlowPromiseResolveFunction(this);
        var reject = new SlowPromiseRejectFunction(this);

        // TODO: temp testing... why async? I think that's not in line with the draft PromisesAPlus constructor standard.
        setImmediate(() => {

            // TODO: Ensure the persistent object graph is safely stored before potentially yielding to the event loop
            storage.saveState();

            // Call the given resolver. This kicks off the asynchronous operation whose outcome the Promise represents.
            try { resolver(resolve, reject); } catch (ex) { reject(ex); }
        });
    }

    /** Returns a new SlowPromise instance that is already resolved with the given value. */
    static resolved(value?: any) {
        var promise = new SlowPromise(null);
        var resolve = new SlowPromiseResolveFunction(promise);
        resolve(value);
        return promise;
    }

    /** Returns a new SlowPromise instance that is already rejected with the given reason. */
    static rejected(reason: any) {
        var promise = new SlowPromise(null);
        var reject = new SlowPromiseRejectFunction(promise);
        reject(reason);
        return promise;
    }

    /** Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate. */
    static deferred() {
        var promise = new SlowPromise(null);
        var resolve = new SlowPromiseResolveFunction(promise);
        var reject = new SlowPromiseRejectFunction(promise);
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
	 * onFulfilled is called when the promise resolves. onRejected is called when the promise rejects.
	 * Both callbacks have a single parameter , the fulfillment value or rejection reason.
	 * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
	 * If an error is thrown in the callback, the returned promise rejects with that error.
	 *
	 * @param onFulfilled called when/if "promise" resolves
	 * @param onRejected called when/if "promise" rejects
	 */
    then(onFulfilled?: (value) => any, onRejected?: (error) => any) {

        // Create the new promise to be returned by this .then() call.
        var deferred2 = SlowPromise.deferred();
        this._slow.handlers.push({ onFulfilled, onRejected, deferred2 });

        // Synchronise with the persistent object graph.
        storage.updated(this);

        // If the promise is already settled, invoke the given handlers now (asynchronously).
        if (this._slow.state !== State.Pending) process.nextTick(() => processAllHandlers(this));

        // Return the chained promise.
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
        type: SlowType.SlowPromise,
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

        // Update the promise state.
        if (this._slow.state !== State.Pending) return;
        [this._slow.state, this._slow.settledValue] = [State.Fulfilled, value];

        // Synchronise with the persistent object graph.
        storage.updated(this);

        // Invoke any already-attached handlers now (asynchronously).
        process.nextTick(() => processAllHandlers(this));
    }

    _reject(reason: any) {

        // Update the promise state.
        if (this._slow.state !== State.Pending) return;
        [this._slow.state, this._slow.settledValue] = [State.Rejected, reason];

        // Synchronise with the persistent object graph.
        storage.updated(this);

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
    while (p._slow.handlers.length > 0) {
        var handler = p._slow.handlers.shift();

        // Synchronise with the persistent object graph.
        storage.updated(p);

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
