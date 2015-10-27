var makeCallableClass = require('../util/makeCallableClass');
var storage = require('../storage/storage');
var registerSlowObjectFactory = require('../storage/registerSlowObjectFactory');
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
        this.$slow = { kind: 12 /* PromiseReject */, promise: promise };
        this.$slowLog = promise ? promise.constructor['$slowLog'] : null;
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
registerSlowObjectFactory(12 /* PromiseReject */, function ($slow) {
    // NB: The rehydration approach used here depends on an implementation detail:
    //     that the given $slow already has a valid `promise` property because that
    //     will always appear in the storage log before any rejectors which use it.
    var reject = new SlowPromiseReject(null);
    reject.$slow = $slow;
    reject.$slowLog = $slow.promise.constructor.$slowLog;
    return reject;
});
module.exports = SlowPromiseReject;
//# sourceMappingURL=slowPromiseReject.js.map