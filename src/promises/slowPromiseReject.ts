import SlowKind = require('../slowKind');
import SlowPromise = require('./slowPromise'); // NB: elided circular ref (for types only)
import makeCallableClass = require('../util/makeCallableClass');
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
}


// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowPromiseReject = <any> makeCallableClass({

    // Create a new SlowPromiseReject instance, tied to the given SlowPromise.
    constructor: function (promise: SlowPromise) {
        var self = <SlowPromiseReject> this;

        // Add slow metadata to the resolve function.
        self.$slow = { kind: SlowKind.PromiseReject, promise };

        // Synchronise with the persistent object graph.
        (<typeof SlowPromise> promise.constructor).epochLog.created(this); // TODO: temp testing...
    },

    // Calling the instance rejects the promise passed to the constructor, with `reason` as the rejection reason.
    call: function (reason?: any) {
        var self = <SlowPromiseReject> this;

        // As per spec, do nothing if promise's fate is already resolved.
        var promise = self.$slow.promise;
        if (promise.$slow.isFateResolved) return;

        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;

        // Synchronise with the persistent object graph.
        (<typeof SlowPromise> promise.constructor).epochLog.updated(promise); // TODO: temp testing...

        // Finally, reject the promise using its own private _reject method.
        promise.reject(reason);
    }
});
