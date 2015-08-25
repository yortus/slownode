var Types = require('slownode');
var _ = require('lodash');
var storage = require('../storage/storage');
var SlowPromise = (function (resolver) {
    var result = {};
    // TODO: temp testing...
    return result;
});
SlowPromise.defer = function () {
    // Create the parts needed for a new SlowPromise instance, and persist them to storage.
    var persistent = {
        state: 0 /* Unresolved */,
        settledValue: void 0,
        handlers: []
    };
    var promiseId = storage.add('SlowPromise', persistent);
    // TODO: ...
    var fulfil = function (value) {
        _a = [2 /* Fulfilled */, value], persistent.state = _a[0], persistent.settledValue = _a[1];
        storage.set('SlowPromise', promiseId, persistent);
        setTimeout(processAllHandlers, 0);
        var _a;
    };
    var reject = function (reason) {
        _a = [3 /* Rejected */, reason], persistent.state = _a[0], persistent.settledValue = _a[1];
        storage.set('SlowPromise', promiseId, persistent);
        setTimeout(processAllHandlers, 0);
        var _a;
    };
    var then = function (onFulfilled, onRejected) {
        var resolver2 = SlowPromise.defer();
        persistent.handlers.push({ onFulfilled: onFulfilled, onRejected: onRejected, resolver2: resolver2 });
        storage.set('SlowPromise', promiseId, persistent);
        var isSettled = persistent.state === 2 /* Fulfilled */ || persistent.state === 3 /* Rejected */;
        if (isSettled)
            setTimeout(processAllHandlers, 0);
        return resolver2.promise;
    };
    // TODO: ...
    var promise = {
        then: then,
        catch: function (onRejected) { return then(void 0, onRejected); },
        _slow: {
            type: 'Promise',
            id: promiseId
        }
    };
    // TODO: ...
    var processAllHandlers = function () {
        // Dequeue each onResolved/onRejected handler in order.
        while (persistent.handlers.length > 0) {
            var handler = persistent.handlers.shift();
            storage.set('SlowPromise', promiseId, persistent);
            // Fulfilled case.
            if (persistent.state === 2 /* Fulfilled */) {
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
            else if (persistent.state === 3 /* Rejected */) {
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
    };
    // Create a resolve function for the SlowPromise.
    var resolveFunction = (function (x) {
        if (persistent.state !== 0 /* Unresolved */)
            return;
        standardResolutionProcedure(promise, x, fulfil, reject);
    });
    resolveFunction._slow = {
        type: 'SlowPromiseResolveFunction',
        id: promiseId
    };
    // Create a reject function for the SlowPromise.
    var rejectFunction = (function (error) {
        if (persistent.state !== 0 /* Unresolved */)
            return;
        reject(error);
    });
    rejectFunction._slow = {
        type: 'SlowPromiseRejectFunction',
        id: promiseId
    };
    // TODO: ...
    return { promise: promise, resolve: resolveFunction, reject: rejectFunction };
};
// TODO: doc...
function isTrustedPromise(p) {
    // TODO: must check for a *trusted* promise. This impl is imperfect in that regard... Review...
    return p && _.isFunction(p.then) && p._slow && p._slow.type === 'Promise';
}
// TODO: This is a transliteration of [[Resolve]](promise, x) pseudocode at https://github.com/promises-aplus/promises-spec
function standardResolutionProcedure(promise, x, fulfil, reject) {
    if (x === promise) {
        reject(new TypeError("slownode: cannot resolve promise with itself"));
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
                        if (ignoreFurtherCalls)
                            return;
                        ignoreFurtherCalls = true;
                        standardResolutionProcedure(promise, y, fulfil, reject);
                    },
                    function rejectPromise(r) {
                        if (ignoreFurtherCalls)
                            return;
                        ignoreFurtherCalls = true;
                        reject(r);
                    },
                ]);
            }
            catch (ex) {
                if (ignoreFurtherCalls)
                    return;
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
module.exports = SlowPromise;
//# sourceMappingURL=slowPromise.js.map