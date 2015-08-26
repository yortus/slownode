import assert = require('assert');
import _ = require('lodash');
import Types = require('slownode');
import storage = require('../storage/storage');
import createNormalPromiseResolver = require('./createNormalPromiseResolver');
export = ctor;


// TODO: doc... sentinel value...
const DEFER = {};


class SlowPromise {

    constructor() {
        //assert(arguments.length === 1);
        this._slow.id = storage.add('SlowPromise', this._saved);

        // TODO: ...
        //if (resolver === DEFER) {
        //}
        //else {
        //}
    }

    // TODO: doc...
    static resolved(value: any) {
        var deferred = SlowPromise.deferred();
        deferred.resolve(value);
        return deferred.promise;
    }

    // TODO: doc...
    static rejected(reason: any) {
        var deferred = SlowPromise.deferred();
        deferred.reject(reason);
        return deferred.promise;
    }

    // TODO: doc...
    static deferred() {
        return promiseFactory();
    }

    then(onFulfilled?: (value) => any, onRejected?: (error) => any) {
        var resolver2 = SlowPromise.deferred();
        this._saved.handlers.push({ onFulfilled, onRejected, resolver2 });
        storage.set('SlowPromise', this._slow.id, this._saved);
        var isSettled = this._saved.state === Types.SlowPromiseState.Fulfilled || this._saved.state === Types.SlowPromiseState.Rejected;
        if (isSettled) setTimeout(() => processAllHandlers(this), 0);
        return resolver2.promise;
    }

    catch(onRejected?: (error) => any) {
        return this.then(void 0, onRejected);
    }

    // TODO: private impl stuff...
    _saved = {
        state: Types.SlowPromiseState.Unresolved,
        settledValue: void 0,
        handlers: <Array<{
            onFulfilled: (value) => any,
            onRejected: (reason) => any,
            resolver2: Types.SlowPromiseDeferred<any>
        }>> []
    };

    _slow = {
        type: 'SlowPromise',
        id: null
    };

    _fulfil(value: any) {
        assert(this._saved.state === Types.SlowPromiseState.Unresolved || this._saved.state === Types.SlowPromiseState.Pending);
        [this._saved.state, this._saved.settledValue] = [Types.SlowPromiseState.Fulfilled, value];
        storage.set('SlowPromise', this._slow.id, this._saved);
        setTimeout(() => processAllHandlers(this), 0);
    }

    _reject(reason: any) {
        assert(this._saved.state === Types.SlowPromiseState.Unresolved || this._saved.state === Types.SlowPromiseState.Pending);
        [this._saved.state, this._saved.settledValue] = [Types.SlowPromiseState.Rejected, reason];
        storage.set('SlowPromise', this._slow.id, this._saved);
        setTimeout(() => processAllHandlers(this), 0);
    }
}


// TODO: doc...
function promiseFactory() {
    var promise = new SlowPromise();
    var resolve = createResolveFunction(promise);
    var reject = createRejectFunction(promise);
    return { promise, resolve, reject };
}


// TODO: doc...
function createResolveFunction(p: SlowPromise) {
    var result: Types.SlowPromiseResolveFunction<any> = <any> ((value?: any) => {
        if (p._saved.state !== Types.SlowPromiseState.Unresolved) return;
        standardResolutionProcedure(p, value, v => p._fulfil(v), r => p._reject(r));
    });
    result._slow = {
        type: 'SlowPromiseResolveFunction',
        id: p._slow.id
    };
    return result;
}


// TODO: doc...
function createRejectFunction(p: SlowPromise) {
    var result: Types.SlowPromiseRejectFunction = <any> ((reason?: any) => {
        if (p._saved.state !== Types.SlowPromiseState.Unresolved) return;
        p._reject(reason);
    });
    result._slow = {
        type: 'SlowPromiseRejectFunction',
        id: p._slow.id
    };
    return result;
}






// TODO: ...
var ctor = <Types.SlowPromiseStatic> <any> SlowPromise;







// TODO: temp testing...
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
                    standardResolutionProcedure(handler.resolver2.promise, ret, handler.resolver2.resolve, handler.resolver2.reject);
                }
                catch (ex) {
                    handler.resolver2.reject(ex);
                }
            }
            else {
                handler.resolver2.resolve(p._saved.settledValue);
            }
        }

        // Rejected case.
        else if (p._saved.state === Types.SlowPromiseState.Rejected) {
            if (_.isFunction(handler.onRejected)) {
                try {
                    var ret = handler.onRejected.apply(void 0, [p._saved.settledValue]);
                    standardResolutionProcedure(handler.resolver2.promise, ret, handler.resolver2.resolve, handler.resolver2.reject);
                }
                catch (ex) {
                    handler.resolver2.reject(ex);
                }
            }
            else {
                handler.resolver2.reject(p._saved.settledValue);
            }
        }
    }
}




















// TODO: doc...
//function isTrustedPromise(p: SlowPromise) {

//    // TODO: must check for a *trusted* promise. This impl is imperfect in that regard... Review...
//    return p && p._slow && p._slow.type === 'SlowPromise';
//}


// TODO: This is a transliteration of [[Resolve]](promise, x) pseudocode at https://github.com/promises-aplus/promises-spec
function standardResolutionProcedure(p: SlowPromise, x: any, fulfil: (value) => void, reject: (error) => void) {
    if (x === p) {
        reject(new TypeError(`slownode: cannot resolve promise with itself`));
    }
    //else if (isTrustedPromise(x)) {
    //    // TODO: implement: (2)(i) If x is pending, promise must remain pending until x is fulfilled or rejected.
    //    //TODO: and set promise.persistent.state = Types.SlowPromiseState.Pending
    //    x.then(fulfil, reject);
    //}
    else if (_.isObject(x) || _.isFunction(x)) {
        try {
            var then = x.then;
        }
        catch (ex) {
            reject(ex);
            return;
        }
        if (_.isFunction(then)) {
            var ignoreFurtherCalls = false;
            try {
        //TODO: and set promise.persistent.state = Types.SlowPromiseState.Pending
                then.apply(x, [
                    function resolvePromise(y) {
                        if (ignoreFurtherCalls) return;
                        ignoreFurtherCalls = true;
                        standardResolutionProcedure(p, y, fulfil, reject);
                    },
                    function rejectPromise(r) {
                        if (ignoreFurtherCalls) return;
                        ignoreFurtherCalls = true;
                        reject(r);
                    },
                ]);
            }
            catch (ex) {
                if (ignoreFurtherCalls) return;
                reject(ex);
            }
        }
        else {
            fulfil(x);
        }
    }
    else {
        fulfil(x);
    }
}
