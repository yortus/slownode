import SlowKind = require('../slowKind');
import persistence = require('../persistence');
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
        id: string;
        promise: SlowPromise;
    };
}


// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowPromiseReject = <any> makeCallableClass({

    // Create a new SlowPromiseReject instance, tied to the given SlowPromise.
    constructor: function (promise: SlowPromise) {

        // Add slow metadata to the resolve function.
        (<SlowPromiseReject> this).$slow = {
            kind: SlowKind.PromiseReject,
            id: null,
            promise: promise
        };

        // Synchronise with the persistent object graph.
        persistence.created(this); // TODO: temp testing...
    },

    // Calling the instance rejects the promise passed to the constructor, with `reason` as the rejection reason.
    call: function (reason?: any) {

        // Reject the promise using its internal reject method.
        var promise = (<SlowPromiseReject> this).$slow.promise;
        promise.reject(reason);
    }
});





// TODO: ==================== rehydration logic... temp testing... ====================
persistence.howToRehydrate(SlowKind.PromiseReject, $slow => {
    var reject = new SlowPromiseReject(null);
    reject.$slow = <any> $slow;
    return reject;
});
