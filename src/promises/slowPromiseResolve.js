var makeCallableClass = require('../util/makeCallableClass');
var standardResolutionProcedure = require('./standardResolutionProcedure');
var storage = require('../storage/storage');
/**
 * Creates a SlowPromiseResolve instance. It may be called with or without `new`.
 * The SlowPromiseResolve instance may be used to resolve the given promise with a value.
 */
var SlowPromiseResolve;
// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowPromiseResolve = makeCallableClass({
    // Create a new SlowPromiseResolve instance, tied to the given SlowPromise.
    constructor: function (promise) {
        // Add slow metadata to the resolve function.
        this.$slow = { kind: 11 /* PromiseResolve */, promise: promise };
        // Synchronise with the persistent object graph.
        storage.created(this);
    },
    // Calling the instance resolves the promise passed to the constructor, with `value` as the resolved value.
    call: function (value) {
        // As per spec, do nothing if promise's fate is already resolved.
        var promise = this.$slow.promise;
        if (promise.$slow.isFateResolved)
            return;
        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;
        // Synchronise with the persistent object graph.
        storage.updated(promise);
        // Finally, resolve the promise using the standard resolution procedure.
        standardResolutionProcedure(promise, value);
    }
});
// Tell storage how to create a SlowPromiseResolve instance.
storage.registerSlowObjectFactory(11 /* PromiseResolve */, function ($slow) {
    var resolve = new SlowPromiseResolve(null);
    resolve.$slow = $slow;
    return resolve;
});
module.exports = SlowPromiseResolve;
//# sourceMappingURL=slowPromiseResolve.js.map