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
        // Add slow metadata to the resolve function.
        this.$slow = { kind: 11 /* PromiseResolve */, promise: promise };
        // Synchronise with the persistent object graph.
        promise.constructor.epochLog.created(this); // TODO: temp testing...
    },
    // Calling the instance resolves the promise passed to the constructor, with `value` as the resolved value.
    call: function (value) {
        // Resolve the promise using the standard resolution procedure.
        var promise = this.$slow.promise;
        standardResolutionProcedure(promise, value);
    }
});
module.exports = SlowPromiseResolve;
//# sourceMappingURL=slowPromiseResolve.js.map