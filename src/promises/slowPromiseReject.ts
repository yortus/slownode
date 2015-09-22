import SlowType = require('../slowType');
import SlowPromise = require('./slowPromise'); // NB: elided circular ref (for types only)
import makeCallableClass = require('../util/makeCallableClass');
import storage = require('../storage/storage');
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

    /** Holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data. */
    $slow: {
        type: SlowType;
        id?: string;
        promise: SlowPromise;
    };
}


// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowPromiseReject = <any> makeCallableClass({

    // Create a new SlowPromiseReject instance, tied to the given SlowPromise.
    constructor: function (promise: SlowPromise) {

        // Add slow metadata to the resolve function.
        this.$slow = { type: SlowType.SlowPromiseReject, promise };

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    // Calling the instance rejects the promise passed to the constructor, with `reason` as the rejection reason.
    call: function (reason?: any) {

        // As per spec, do nothing if promise's fate is already resolved.
        var promise: SlowPromise = this.$slow.promise;
        if (promise.$slow.isFateResolved) return;

        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;

        // Synchronise with the persistent object graph.
        storage.updated(promise);

        // Finally, reject the promise using its own private _reject method.
        promise.reject(reason);
    }
});


// Tell storage how to create a SlowPromiseReject instance.
storage.registerSlowObjectFactory(SlowType.SlowPromiseReject, $slow => {
    var reject = new SlowPromiseReject(null);
    reject.$slow = <any> $slow;
    return reject;
});
