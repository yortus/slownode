import assert = require('assert');
import _ = require('lodash');
import Types = require('slownode');
import storage = require('../storage/storage');
export = slowPromiseConstructorFunction;


/** Sentinal value used for internal promise constructor calls. */
const DEFER = {};


class SlowPromise {

    /** Constructs a SlowPromise instance. May be called with or without new. */
    constructor(resolver) {

        // Validate arguments.
        assert(_.isFunction(resolver) || resolver == DEFER);

        // Finish basic construction.
        this._slow.id = storage.add('SlowPromise', this._saved);

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
        this._saved.handlers.push({ onFulfilled, onRejected, deferred2 });
        storage.set('SlowPromise', this._slow.id, this._saved);
        var isSettled = this._saved.state === Types.SlowPromiseState.Fulfilled || this._saved.state === Types.SlowPromiseState.Rejected;
        if (isSettled) setTimeout(() => processAllHandlers(this), 0);
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
        id: null
    };

    _saved = {
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
        if (this._saved.state !== Types.SlowPromiseState.Pending) return;
        [this._saved.state, this._saved.settledValue] = [Types.SlowPromiseState.Fulfilled, value];
        storage.set('SlowPromise', this._slow.id, this._saved);
        setTimeout(() => processAllHandlers(this), 0);
    }

    _reject(reason: any) {
        if (this._saved.state !== Types.SlowPromiseState.Pending) return;
        [this._saved.state, this._saved.settledValue] = [Types.SlowPromiseState.Rejected, reason];
        storage.set('SlowPromise', this._slow.id, this._saved);
        setTimeout(() => processAllHandlers(this), 0);
    }
}


/** Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate. */
function makeDeferred() {

    // Get a new promise instance using the internal constructor.
    var promise = new SlowPromise(DEFER);

    // Make the resolve function. It must be serializble.
    var resolve: Types.SlowPromiseResolveFunction<any> = <any> ((value?: any) => {
        if (promise._saved.isFateResolved) return;
        promise._saved.isFateResolved = true;
        standardResolutionProcedure(promise, value);
    });
    resolve._slow = { type: 'SlowPromiseResolveFunction', id: promise._slow.id };

    // Make the reject function. It must be serializble.
    var reject: Types.SlowPromiseRejectFunction = <any> ((reason?: any) => {
        if (promise._saved.isFateResolved) return;
        promise._saved.isFateResolved = true;
        promise._reject(reason);
    });
    reject._slow = { type: 'SlowPromiseRejectFunction', id: promise._slow.id };

    // All done.
    return { promise, resolve, reject };
}


/** The SlowPromise constructor function cast to the full SlowPromise generic type defined in the .d.ts. */
var slowPromiseConstructorFunction = <Types.SlowPromiseStatic> <any> SlowPromise;


/**
 * Dequeues and processes all enqueued onFulfilled/onRejected handlers.
 * The SlowPromise implementation calls this when `p` is settled, and
 * on each `then` call made after `p` is settled.
 */
function processAllHandlers(p: SlowPromise) {

    // Dequeue each onResolved/onRejected handler in order.
    while (p._saved.handlers.length > 0) {
        var handler = p._saved.handlers.shift();
        storage.set('SlowPromise', p._slow.id, p._saved);

        // Fulfilled case.
        if (p._saved.state === Types.SlowPromiseState.Fulfilled) {
            if (_.isFunction(handler.onFulfilled)) {
                try {
                    var ret = handler.onFulfilled.apply(void 0, [p._saved.settledValue]);
                    standardResolutionProcedure(handler.deferred2.promise, ret);
                }
                catch (ex) {
                    handler.deferred2.reject(ex);
                }
            }
            else {
                handler.deferred2.resolve(p._saved.settledValue);
            }
        }

        // Rejected case.
        else if (p._saved.state === Types.SlowPromiseState.Rejected) {
            if (_.isFunction(handler.onRejected)) {
                try {
                    var ret = handler.onRejected.apply(void 0, [p._saved.settledValue]);
                    standardResolutionProcedure(handler.deferred2.promise, ret);
                }
                catch (ex) {
                    handler.deferred2.reject(ex);
                }
            }
            else {
                handler.deferred2.reject(p._saved.settledValue);
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
