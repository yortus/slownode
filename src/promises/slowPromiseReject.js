var persistence = require('../persistence');
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
        // Add slow metadata to the resolve function.
        this.$slow = {
            kind: 202 /* PromiseReject */,
            id: null,
            promise: promise
        };
        // Synchronise with the persistent object graph.
        persistence.created(this); // TODO: temp testing...
    },
    // Calling the instance rejects the promise passed to the constructor, with `reason` as the rejection reason.
    call: function (reason) {
        // Reject the promise using its internal reject method.
        var promise = this.$slow.promise;
        promise.reject(reason);
    }
});
// TODO: ==================== rehydration logic... temp testing... ====================
persistence.howToRehydrate(202 /* PromiseReject */, function ($slow) {
    var reject = new SlowPromiseReject(null);
    reject.$slow = $slow;
    return reject;
});
module.exports = SlowPromiseReject;
//# sourceMappingURL=slowPromiseReject.js.map