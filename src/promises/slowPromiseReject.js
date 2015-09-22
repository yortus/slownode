var makeCallableClass = require('../util/makeCallableClass');
var storage = require('../storage/storage');
/**
 * Creates a SlowPromiseReject instance. It may be called with or without `new`.
 * The SlowPromiseReject instance may be used to reject the given promise with a reason.
 */
var SlowPromiseReject;
// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowPromiseReject = makeCallableClass({
    // Create a new SlowPromiseReject instance, tied to the given SlowPromise.
    constructor: function (promise) {
        // Add slow metadata to the resolve function.
        this.$slow = { type: 12 /* SlowPromiseReject */, promise: promise };
        // Synchronise with the persistent object graph.
        storage.created(this);
    },
    // Calling the instance rejects the promise passed to the constructor, with `reason` as the rejection reason.
    call: function (reason) {
        // As per spec, do nothing if promise's fate is already resolved.
        var promise = this.$slow.promise;
        if (promise.$slow.isFateResolved)
            return;
        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;
        // Synchronise with the persistent object graph.
        storage.updated(promise);
        // Finally, reject the promise using its own private _reject method.
        promise.reject(reason);
    }
});
// Tell storage how to create a SlowPromiseReject instance.
storage.registerSlowObjectFactory(12 /* SlowPromiseReject */, function ($slow) {
    var reject = new SlowPromiseReject(null);
    reject.$slow = $slow;
    return reject;
});
module.exports = SlowPromiseReject;
//# sourceMappingURL=slowPromiseReject.js.map