var makeCallableClass = require('../util/makeCallableClass');
/**
 * Creates a SlowPromiseReject instance. It may be called with or without `new`.
 * The SlowPromiseReject instance may be used to reject the given promise with a reason.
 */
var SlowPromiseReject;
// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowPromiseReject = makeCallableClass({
    // Create a new SlowPromiseReject instance, tied to the given SlowPromise.
    constructor: function (promise) {
        var self = this;
        // Add slow metadata to the resolve function.
        self.$slow = { kind: 12 /* PromiseReject */, promise: promise };
        // Synchronise with the persistent object graph.
        promise.constructor.epochLog.created(this); // TODO: temp testing...
    },
    // Calling the instance rejects the promise passed to the constructor, with `reason` as the rejection reason.
    call: function (reason) {
        var self = this;
        // As per spec, do nothing if promise's fate is already resolved.
        var promise = self.$slow.promise;
        if (promise.$slow.isFateResolved)
            return;
        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;
        // Synchronise with the persistent object graph.
        promise.constructor.epochLog.updated(promise); // TODO: temp testing...
        // Finally, reject the promise using its own private _reject method.
        promise.reject(reason);
    }
});
module.exports = SlowPromiseReject;
//# sourceMappingURL=slowPromiseReject.js.map