var assert = require('assert');
var _ = require('lodash');
var Types = require('slownode');
var storage = require('../storage/storage');
var SlowPromise = (function () {
    function SlowPromise() {
        // TODO: private impl stuff...
        this.persistent = {
            state: 0 /* Unresolved */,
            settledValue: void 0,
            handlers: []
        };
        this._slow = {
            type: 'SlowPromise',
            id: null
        };
        // TODO: ...
        this._slow.id = storage.add('SlowPromise', this.persistent);
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
        return deferredImpl();
    };
    SlowPromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        var resolver2 = SlowPromise.deferred();
        this.persistent.handlers.push({ onFulfilled: onFulfilled, onRejected: onRejected, resolver2: resolver2 });
        storage.set('SlowPromise', this._slow.id, this.persistent);
        var isSettled = this.persistent.state === 2 /* Fulfilled */ || this.persistent.state === 3 /* Rejected */;
        if (isSettled)
            setTimeout(function () { return processAllHandlers(_this); }, 0);
        return resolver2.promise;
    };
    SlowPromise.prototype.catch = function (onRejected) {
        return this.then(void 0, onRejected);
    };
    SlowPromise.prototype._fulfil = function (value) {
        var _this = this;
        assert(this.persistent.state === 0 /* Unresolved */ || this.persistent.state === 1 /* Pending */);
        _a = [2 /* Fulfilled */, value], this.persistent.state = _a[0], this.persistent.settledValue = _a[1];
        storage.set('SlowPromise', this._slow.id, this.persistent);
        setTimeout(function () { return processAllHandlers(_this); }, 0);
        var _a;
    };
    SlowPromise.prototype._reject = function (reason) {
        var _this = this;
        assert(this.persistent.state === 0 /* Unresolved */ || this.persistent.state === 1 /* Pending */);
        _a = [3 /* Rejected */, reason], this.persistent.state = _a[0], this.persistent.settledValue = _a[1];
        storage.set('SlowPromise', this._slow.id, this.persistent);
        setTimeout(function () { return processAllHandlers(_this); }, 0);
        var _a;
    };
    return SlowPromise;
})();
// TODO: ...
var ctor = SlowPromise;
// TODO: doc...
function deferredImpl() {
    // TODO: ...
    var p = new SlowPromise();
    // Create a resolve function for the SlowPromise.
    var resolveFunction = (function (x) {
        if (p.persistent.state !== 0 /* Unresolved */)
            return;
        standardResolutionProcedure(p, x, function (v) { return p._fulfil(v); }, function (r) { return p._reject(r); });
    });
    resolveFunction._slow = {
        type: 'SlowPromiseResolveFunction',
        id: p._slow.id
    };
    // Create a reject function for the SlowPromise.
    var rejectFunction = (function (error) {
        if (p.persistent.state !== 0 /* Unresolved */)
            return;
        p._reject(error);
    });
    rejectFunction._slow = {
        type: 'SlowPromiseRejectFunction',
        id: p._slow.id
    };
    // TODO: ...
    return { promise: p, resolve: resolveFunction, reject: rejectFunction };
}
// TODO: temp testing...
function processAllHandlers(p) {
    // Dequeue each onResolved/onRejected handler in order.
    while (p.persistent.handlers.length > 0) {
        var handler = p.persistent.handlers.shift();
        storage.set('SlowPromise', p._slow.id, p.persistent);
        // Fulfilled case.
        if (p.persistent.state === 2 /* Fulfilled */) {
            if (_.isFunction(handler.onFulfilled)) {
                try {
                    var ret = handler.onFulfilled.apply(void 0, [p.persistent.settledValue]);
                    standardResolutionProcedure(handler.resolver2.promise, ret, handler.resolver2.resolve, handler.resolver2.reject);
                }
                catch (ex) {
                    handler.resolver2.reject(ex);
                }
            }
            else {
                handler.resolver2.resolve(p.persistent.settledValue);
            }
        }
        else if (p.persistent.state === 3 /* Rejected */) {
            if (_.isFunction(handler.onRejected)) {
                try {
                    var ret = handler.onRejected.apply(void 0, [p.persistent.settledValue]);
                    standardResolutionProcedure(handler.resolver2.promise, ret, handler.resolver2.resolve, handler.resolver2.reject);
                }
                catch (ex) {
                    handler.resolver2.reject(ex);
                }
            }
            else {
                handler.resolver2.reject(p.persistent.settledValue);
            }
        }
    }
}
// TODO: doc...
function isTrustedPromise(p) {
    // TODO: must check for a *trusted* promise. This impl is imperfect in that regard... Review...
    return p && p._slow && p._slow.type === 'SlowPromise';
}
// TODO: This is a transliteration of [[Resolve]](promise, x) pseudocode at https://github.com/promises-aplus/promises-spec
function standardResolutionProcedure(promise, x, fulfil, reject) {
    if (x === promise) {
        reject(new TypeError("slownode: cannot resolve promise with itself"));
    }
    else if (isTrustedPromise(x)) {
        // TODO: implement: (2)(i) If x is pending, promise must remain pending until x is fulfilled or rejected.
        //TODO: and set promise.persistent.state = Types.SlowPromiseState.Pending
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
                //TODO: and set promise.persistent.state = Types.SlowPromiseState.Pending
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
module.exports = ctor;
//# sourceMappingURL=slowPromise.js.map