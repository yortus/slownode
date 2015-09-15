var makeCallableClass = require('../util/makeCallableClass');
var standardResolutionProcedure = require('./standardResolutionProcedure');
var storage = require('../storage/storage');
/**
 * Create a SlowPromiseResolve callable instance.
 * It may be called to resolve the given promise with a value.
 */
var SlowPromiseResolve = makeCallableClass({
    // TODO: doc...
    constructor: function (promise) {
        // Add slow metadata to the resolve function.
        this.$slow = { type: 11 /* SlowPromiseResolve */, promise: promise };
        // Synchronise with the persistent object graph.
        storage.created(this);
    },
    // TODO: doc...
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
storage.registerSlowObjectFactory(11 /* SlowPromiseResolve */, function ($slow) {
    var resolve = new SlowPromiseResolve(null);
    resolve.$slow = $slow;
    return resolve;
});
module.exports = SlowPromiseResolve;
//# sourceMappingURL=slowPromiseResolve.js.map