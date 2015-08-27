import assert = require('assert');
import _ = require('lodash');
import Types = require('slownode');
import storage = require('./storage/storage');
export = SlowPromise;





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
const DEFER: any = {};


class SlowPromise {

    /** Constructs a SlowPromise instance. May be called with or without new. */
    constructor(resolver: (resolve: (value?: any) => void, reject: (reason?: any) => void) => void) {

        // Validate arguments.
        assert(_.isFunction(resolver) || resolver == DEFER);

        // Persist to storage.
        storage.upsert(this);

        // If this is an internal call from makeDeferred(), return the promise now.
        if (resolver === DEFER) return this;

        // Otherwise, construct a deferred promise, then call the given resolver with the resolve and reject functions.
        var deferred = makeDeferred();
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
        return makeDeferred();
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
        if (this._slow.state !== Types.SlowPromiseState.Pending) setTimeout(() => processAllHandlers(this), 0);
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
        state: Types.SlowPromiseState.Pending,
        settledValue: void 0,
        handlers: <Array<{
            onFulfilled: (value) => any,
            onRejected: (reason) => any,
            deferred2: Types.SlowPromiseDeferred<any>
        }>> []
    };

    _fulfil(value: any) {
        if (this._slow.state !== Types.SlowPromiseState.Pending) return;
        [this._slow.state, this._slow.settledValue] = [Types.SlowPromiseState.Fulfilled, value];
        storage.upsert(this);
        setTimeout(() => processAllHandlers(this), 0);
    }

    _reject(reason: any) {
        if (this._slow.state !== Types.SlowPromiseState.Pending) return;
        [this._slow.state, this._slow.settledValue] = [Types.SlowPromiseState.Rejected, reason];
        storage.upsert(this);
        setTimeout(() => processAllHandlers(this), 0);
    }
}


/** Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate. */
function makeDeferred() {

    // Get a new promise instance using the internal constructor.
    var promise = new SlowPromise(DEFER);

    //// TODO: temp testing...
    //notifyGC(promise);

    // Make the resolve function and persist it.
    var resolve: Types.SlowPromiseResolveFunction<any> = <any> ((value?: any) => {
        if (promise._slow.isFateResolved) return;
        promise._slow.isFateResolved = true;
        storage.upsert(promise);
        standardResolutionProcedure(promise, value);
    });
    resolve._slow = { type: 'SlowPromiseResolveFunction', promise };
    storage.upsert(resolve);

    // Make the reject function and persist it.
    var reject: Types.SlowPromiseRejectFunction = <any> ((reason?: any) => {
        if (promise._slow.isFateResolved) return;
        promise._slow.isFateResolved = true;
        storage.upsert(promise);
        promise._reject(reason);
    });
    reject._slow = { type: 'SlowPromiseRejectFunction', promise };
    storage.upsert(reject);

    // All done.
    return { promise, resolve, reject };
}


/**
 * Dequeues and processes all enqueued onFulfilled/onRejected handlers.
 * The SlowPromise implementation calls this when `p` is settled, and
 * on each `then` call made after `p` is settled.
 */
function processAllHandlers(p: SlowPromise) {

    // Dequeue each onResolved/onRejected handler in order.
    while (p._slow.handlers.length > 0) {
        var handler = p._slow.handlers.shift();
        storage.upsert(p);

        // Fulfilled case.
        if (p._slow.state === Types.SlowPromiseState.Fulfilled) {
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
        else if (p._slow.state === Types.SlowPromiseState.Rejected) {
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
function standardResolutionProcedure(p: SlowPromise, x: any) {
    if (x === p) {
        p._reject(new TypeError(`slownode: cannot resolve promise with itself`));
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
                        if (ignoreFurtherCalls) return;
                        ignoreFurtherCalls = true;
                        standardResolutionProcedure(p, y);
                    },
                    function rejectPromise(r) {
                        if (ignoreFurtherCalls) return;
                        ignoreFurtherCalls = true;
                        p._reject(r);
                    },
                ]);
            }
            catch (ex) {
                if (ignoreFurtherCalls) return;
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
