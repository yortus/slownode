import SlowKind = require('../slowKind');
import SlowLog = require('../slowLog');
import SlowPromise = require('./slowPromise'); // NB: elided circular ref (for types only)
import makeCallableClass = require('../util/makeCallableClass');
import registerSlowObjectFactory = require('../storage/registerSlowObjectFactory');
export = SlowPromiseReject;


/**
 * Creates a SlowPromiseReject instance. It may be called with or without `new`.
 * The SlowPromiseReject instance may be used to reject the given promise with a reason.
 */
var SlowPromiseReject: {

    /** Creates a SlowPromiseReject instance. */
    new(promise: SlowPromise): SlowPromiseReject;

    /** Creates a SlowPromiseReject instance. */
    (promise: SlowPromise): SlowPromiseReject;
}
interface SlowPromiseReject {

    /** Calling the instance rejects the promise passed to the constructor, with `reason` as the rejection reason. */
    (reason?: any): void;

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
SlowPromiseReject = <any> makeCallableClass({

    // Create a new SlowPromiseReject instance, tied to the given SlowPromise.
    constructor: function (promise: SlowPromise) {

        // Add slow metadata to the resolve function.
        this.$slow = { kind: SlowKind.PromiseReject, promise };
        this.$slowLog = promise ? promise.constructor['$slowLog'] : null;

        // Synchronise with the persistent object graph.
        if (this.$slowLog) this.$slowLog.created(this); // TODO: temp testing...
    },

    // Calling the instance rejects the promise passed to the constructor, with `reason` as the rejection reason.
    call: function (reason?: any) {

        // As per spec, do nothing if promise's fate is already resolved.
        var promise: SlowPromise = this.$slow.promise;
        if (promise.$slow.isFateResolved) return;

        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;

        // Synchronise with the persistent object graph.
        this.$slowLog.updated(promise); // TODO: temp testing...

        // Finally, reject the promise using its own private _reject method.
        promise.reject(reason);
    }
});


// Tell storage how to create a SlowPromiseReject instance.
registerSlowObjectFactory(SlowKind.PromiseReject, ($slow: any) => {
    // NB: The rehydration approach used here depends on an implementation detail:
    //     that the given $slow already has a valid `promise` property because that
    //     will always appear in the storage log before any rejectors which use it.
    var reject = new SlowPromiseReject(null);
    reject.$slow = $slow;
    reject.$slowLog = $slow.promise.constructor.$slowLog;
    return reject;
});
