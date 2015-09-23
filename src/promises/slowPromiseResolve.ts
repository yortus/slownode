import SlowKind = require('../slowKind');
import SlowLog = require('../slowLog');
import SlowPromise = require('./slowPromise'); // NB: elided circular ref (for types only)
import makeCallableClass = require('../util/makeCallableClass');
import standardResolutionProcedure = require('./standardResolutionProcedure');
import storage = require('../storage/storage');
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

    /** INTERNAL the SlowLog to which this instance is bound. It matches that of the promise passed to the constructor. */
    $slowLog: SlowLog;
}


// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowPromiseResolve = <any> makeCallableClass({

    // Create a new SlowPromiseResolve instance, tied to the given SlowPromise.
    constructor: function (promise: SlowPromise) {

        // Add slow metadata to the resolve function.
        this.$slow = { kind: SlowKind.PromiseResolve, promise };
        this.$slowLog = promise ? promise.constructor['$slowLog'] : null;

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    // Calling the instance resolves the promise passed to the constructor, with `value` as the resolved value.
    call: function (value?: any) {

        // As per spec, do nothing if promise's fate is already resolved.
        var promise: SlowPromise = this.$slow.promise;
        if (promise.$slow.isFateResolved) return;

        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;

        // Synchronise with the persistent object graph.
        storage.updated(promise);

        // Finally, resolve the promise using the standard resolution procedure.
        standardResolutionProcedure(promise, value);
    }
});


// Tell storage how to create a SlowPromiseResolve instance.
storage.registerSlowObjectFactory(SlowKind.PromiseResolve, ($slow: any) => {
    // NB: The rehydration approach used here depends on an implementation detail:
    //     that the given $slow already has a valid `promise` property because that
    //     will always appear in the storage log before any resolvers which use it.
    var resolve = new SlowPromiseResolve(null);
    resolve.$slow = $slow;
    resolve.$slowLog = $slow.promise.constructor.$slowLog;
    return resolve;
});
