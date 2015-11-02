import SlowKind = require('../slowKind');
import SlowPromise = require('./slowPromise'); // NB: elided circular ref (for types only)
import makeCallableClass = require('../util/makeCallableClass');
import standardResolutionProcedure = require('./standardResolutionProcedure');
export = SlowPromiseResolve;


/**
 * Creates a SlowPromiseResolve instance. It may be called with or without `new`.
 * The SlowPromiseResolve instance may be used to resolve the given promise with a value.
 */
var SlowPromiseResolve: {

    /** Creates a SlowPromiseResolve instance. */
    new(promise: SlowPromise): SlowPromiseResolve;

    /** Creates a SlowPromiseResolve instance. */
    (promise: SlowPromise): SlowPromiseResolve;
}
interface SlowPromiseResolve {

    /** Calling the instance resolves the promise passed to the constructor, with `value` as the resolved value. */
    (value?: any): void;

    /** INTERNAL holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data. */
    $slow: {
        kind: SlowKind;
        id?: string;
        promise: SlowPromise;
    };
}


// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowPromiseResolve = <any> makeCallableClass({

    // Create a new SlowPromiseResolve instance, tied to the given SlowPromise.
    constructor: function (promise: SlowPromise) {
        var self = <SlowPromiseResolve> this;

        // Add slow metadata to the resolve function.
        self.$slow = { kind: SlowKind.PromiseResolve, promise };

        // Synchronise with the persistent object graph.
        (<typeof SlowPromise> promise.constructor).epochLog.created(this); // TODO: temp testing...
    },

    // Calling the instance resolves the promise passed to the constructor, with `value` as the resolved value.
    call: function (value?: any) {
        var self = <SlowPromiseResolve> this;

        // As per spec, do nothing if promise's fate is already resolved.
        var promise = self.$slow.promise;
        if (promise.$slow.isFateResolved) return;

        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;

        // Synchronise with the persistent object graph.
        (<typeof SlowPromise> promise.constructor).epochLog.updated(promise); // TODO: temp testing...

        // Finally, resolve the promise using the standard resolution procedure.
        standardResolutionProcedure(promise, value);
    }
});
