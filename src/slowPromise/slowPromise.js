var assert = require('assert');
var _ = require('lodash');
var Types = require('slownode');
var storage = require('../storage/storage');
// TODO: doc... sentinel value...
var DEFER = {};
var SlowPromise = (function () {
    function SlowPromise() {
        // TODO: private impl stuff...
        this._saved = {
            state: 0 /* Unresolved */,
            settledValue: void 0,
            handlers: []
        };
        this._slow = {
            type: 'SlowPromise',
            id: null
        };
        //assert(arguments.length === 1);
        this._slow.id = storage.add('SlowPromise', this._saved);
        // TODO: ...
        //if (resolver === DEFER) {
        //}
        //else {
        //}
    }
    // TODO: doc...
    SlowPromise.resolved = function (value) {
        var deferred = SlowPromise.deferred();
        deferred.resolve(value);
        return deferred.promise;
    };
    // TODO: doc...
    SlowPromise.rejected = function (reason) {
        var deferred = SlowPromise.deferred();
        deferred.reject(reason);
        return deferred.promise;
    };
    // TODO: doc...
    SlowPromise.deferred = function () {
        return promiseFactory();
    };
    SlowPromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        var resolver2 = SlowPromise.deferred();
        this._saved.handlers.push({ onFulfilled: onFulfilled, onRejected: onRejected, resolver2: resolver2 });
        storage.set('SlowPromise', this._slow.id, this._saved);
        var isSettled = this._saved.state === 2 /* Fulfilled */ || this._saved.state === 3 /* Rejected */;
        if (isSettled)
            setTimeout(function () { return processAllHandlers(_this); }, 0);
        return resolver2.promise;
    };
    SlowPromise.prototype.catch = function (onRejected) {
        return this.then(void 0, onRejected);
    };
    SlowPromise.prototype._fulfil = function (value) {
        var _this = this;
        assert(this._saved.state === 0 /* Unresolved */ || this._saved.state === 1 /* Pending */);
        _a = [2 /* Fulfilled */, value], this._saved.state = _a[0], this._saved.settledValue = _a[1];
        storage.set('SlowPromise', this._slow.id, this._saved);
        setTimeout(function () { return processAllHandlers(_this); }, 0);
        var _a;
    };
    SlowPromise.prototype._reject = function (reason) {
        var _this = this;
        assert(this._saved.state === 0 /* Unresolved */ || this._saved.state === 1 /* Pending */);
        _a = [3 /* Rejected */, reason], this._saved.state = _a[0], this._saved.settledValue = _a[1];
        storage.set('SlowPromise', this._slow.id, this._saved);
        setTimeout(function () { return processAllHandlers(_this); }, 0);
        var _a;
    };
    return SlowPromise;
})();
// TODO: doc...
function promiseFactory() {
    var promise = new SlowPromise();
    var resolve = createResolveFunction(promise);
    var reject = createRejectFunction(promise);
    return { promise: promise, resolve: resolve, reject: reject };
}
// TODO: doc...
function createResolveFunction(p) {
    var result = (function (value) {
        if (p._saved.state !== 0 /* Unresolved */)
            return;
        standardResolutionProcedure(p, value, function (v) { return p._fulfil(v); }, function (r) { return p._reject(r); });
    });
    result._slow = {
        type: 'SlowPromiseResolveFunction',
        id: p._slow.id
    };
    return result;
}
// TODO: doc...
function createRejectFunction(p) {
    var result = (function (reason) {
        if (p._saved.state !== 0 /* Unresolved */)
            return;
        p._reject(reason);
    });
    result._slow = {
        type: 'SlowPromiseRejectFunction',
        id: p._slow.id
    };
    return result;
}
// TODO: ...
var ctor = SlowPromise;
// TODO: temp testing...
function processAllHandlers(p) {
    // Dequeue each onResolved/onRejected handler in order.
    while (p._saved.handlers.length > 0) {
        var handler = p._saved.handlers.shift();
        storage.set('SlowPromise', p._slow.id, p._saved);
        // Fulfilled case.
        if (p._saved.state === 2 /* Fulfilled */) {
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
        else if (p._saved.state === 3 /* Rejected */) {
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
function standardResolutionProcedure(p, x, fulfil, reject) {
    if (x === p) {
        reject(new TypeError("slownode: cannot resolve promise with itself"));
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
                //TODO: and set promise.persistent.state = Types.SlowPromiseState.Pending
                then.apply(x, [
                    function resolvePromise(y) {
                        if (ignoreFurtherCalls)
                            return;
                        ignoreFurtherCalls = true;
                        standardResolutionProcedure(p, y, fulfil, reject);
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
module.exports = ctor;
//# sourceMappingURL=slowPromise.js.map