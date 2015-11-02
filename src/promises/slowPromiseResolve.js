var makeCallableClass = require('../util/makeCallableClass');
var standardResolutionProcedure = require('./standardResolutionProcedure');
/**
 * Creates a SlowPromiseResolve instance. It may be called with or without `new`.
 * The SlowPromiseResolve instance may be used to resolve the given promise with a value.
 */
var SlowPromiseResolve;
// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowPromiseResolve = makeCallableClass({
    // Create a new SlowPromiseResolve instance, tied to the given SlowPromise.
    constructor: function (promise) {
        var self = this;
        // Add slow metadata to the resolve function.
        self.$slow = { kind: 11 /* PromiseResolve */, promise: promise };
        // Synchronise with the persistent object graph.
        promise.constructor.epochLog.created(this); // TODO: temp testing...
    },
    // Calling the instance resolves the promise passed to the constructor, with `value` as the resolved value.
    call: function (value) {
        var self = this;
        // As per spec, do nothing if promise's fate is already resolved.
        var promise = self.$slow.promise;
        if (promise.$slow.isFateResolved)
            return;
        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;
        // Synchronise with the persistent object graph.
        promise.constructor.epochLog.updated(promise); // TODO: temp testing...
        // Finally, resolve the promise using the standard resolution procedure.
        standardResolutionProcedure(promise, value);
    }
});
module.exports = SlowPromiseResolve;
//# sourceMappingURL=slowPromiseResolve.js.map