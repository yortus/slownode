import Types = require('slownode');
import _ = require('lodash');
import async = require("asyncawait/async");
import await = require("asyncawait/await");
import storage = require('../storage/storage');
import createNormalPromiseResolver = require('./createNormalPromiseResolver');
export = SlowPromise;


var SlowPromise: Types.SlowPromiseStatic = <any> ((resolver: any) => {
    var result: Types.SlowPromiseStatic = <any> {};

    // TODO: temp testing...

    return result;
});


SlowPromise.deferred = (/*TODO: reinstate   was... spid?: number*/) => {

    // Create the parts needed for a new SlowPromise instance, and persist them to storage.
    var persistent = {
        state: Types.SlowPromiseState.Unresolved,
        settledValue: void 0,
        handlers: <Array<{
            onFulfilled: (value) => any,
            onRejected: (reason) => any,
            resolver2: Types.SlowPromiseDeferred<any>
        }>> []
    };
    var promiseId = storage.add('SlowPromise', persistent);


    // TODO: ...
    var fulfil = (value: any) => {
        [persistent.state, persistent.settledValue] = [Types.SlowPromiseState.Fulfilled, value];
        storage.set('SlowPromise', promiseId, persistent);
        setTimeout(processAllHandlers, 0);
    }
    var reject = (reason: any) => {
        [persistent.state, persistent.settledValue] = [Types.SlowPromiseState.Rejected, reason];
        storage.set('SlowPromise', promiseId, persistent);
        setTimeout(processAllHandlers, 0);
    }
    var then = (onFulfilled?: (value) => any, onRejected?: (error) => any) => {
        var resolver2 = SlowPromise.deferred();
        persistent.handlers.push({ onFulfilled, onRejected, resolver2 });
        storage.set('SlowPromise', promiseId, persistent);
        var isSettled = persistent.state === Types.SlowPromiseState.Fulfilled || persistent.state === Types.SlowPromiseState.Rejected;
        if (isSettled) setTimeout(processAllHandlers, 0);
        return resolver2.promise;
    };


    // TODO: ...
    var promise: Types.SlowPromise<any> = {
        then: then,
        catch: (onRejected?: (error) => any) => then(void 0, onRejected),
        _slow: {
            type: 'Promise',
            id: promiseId
        }
    };


    // TODO: temp testing - remove async() - but needed to work with sqliteInFiber adapter...
    var processAllHandlers = async(() => {

        // Dequeue each onResolved/onRejected handler in order.
        while (persistent.handlers.length > 0) {
            var handler = persistent.handlers.shift();
            storage.set('SlowPromise', promiseId, persistent);

            // Fulfilled case.
            if (persistent.state === Types.SlowPromiseState.Fulfilled) {
                if (_.isFunction(handler.onFulfilled)) {
                    try {
                        var ret = handler.onFulfilled.apply(void 0, [persistent.settledValue]);
                        if (ret !== void 0) {
                            standardResolutionProcedure(handler.resolver2.promise, ret, handler.resolver2.resolve, handler.resolver2.reject);
                        }
                    }
                    catch (ex) {
                        handler.resolver2.reject(ex);
                    }
                }
                else {
                    handler.resolver2.resolve(persistent.settledValue);
                }
            }

            // Rejected case.
            else if (persistent.state === Types.SlowPromiseState.Rejected) {
                if (_.isFunction(handler.onRejected)) {
                    try {
                        var ret = handler.onRejected.apply(void 0, [persistent.settledValue]);
                        if (ret !== void 0) {
                            standardResolutionProcedure(handler.resolver2.promise, ret, handler.resolver2.resolve, handler.resolver2.reject);
                        }
                    }
                    catch (ex) {
                        handler.resolver2.reject(ex);
                    }
                }
                else {
                    handler.resolver2.reject(persistent.settledValue);
                }
            }
        }
    });


    // Create a resolve function for the SlowPromise.
    var resolveFunction: Types.SlowPromiseResolveFunction<any> = <any> ((x?: any) => {
        if (persistent.state !== Types.SlowPromiseState.Unresolved) return;
        standardResolutionProcedure(promise, x, fulfil, reject);
    });
    resolveFunction._slow = {
        type: 'SlowPromiseResolveFunction',
        id: promiseId
    };


    // Create a reject function for the SlowPromise.
    var rejectFunction: Types.SlowPromiseRejectFunction = <any> ((error?: any) => {
        if (persistent.state !== Types.SlowPromiseState.Unresolved) return;
        reject(error);
    });
    rejectFunction._slow = {
        type: 'SlowPromiseRejectFunction',
        id: promiseId
    };


    // TODO: ...
    return { promise, resolve: resolveFunction, reject: rejectFunction };
};


// TODO: doc...
function isTrustedPromise(p) {

    // TODO: must check for a *trusted* promise. This impl is imperfect in that regard... Review...
    return p && _.isFunction(p.then) && p._slow && p._slow.type === 'Promise';
}


// TODO: This is a transliteration of [[Resolve]](promise, x) pseudocode at https://github.com/promises-aplus/promises-spec
function standardResolutionProcedure(promise: Types.SlowPromise<any>, x: any, fulfil: (value) => void, reject: (error) => void) {
    if (x === promise) {
        reject(new TypeError(`slownode: cannot resolve promise with itself`));
    }
    else if (isTrustedPromise(x)) {
        // TODO: implement: (2)(i) If x is pending, promise must remain pending until x is fulfilled or rejected.
        x.then(fulfil, reject);
    }
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
                then.apply(x, [
                    function resolvePromise(y) {
                        if (ignoreFurtherCalls) return;
                        ignoreFurtherCalls = true;
                        standardResolutionProcedure(promise, y, fulfil, reject);
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
