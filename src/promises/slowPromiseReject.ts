import SlowType = require('../slowType');
import SlowPromise = require('./slowPromise'); // NB: elided circular ref (for types only)
import makeCallableClass = require('../util/makeCallableClass');
import storage = require('../storage/storage');
export = SlowPromiseReject;


var SlowPromiseReject: {
    new(promise: SlowPromise): SlowPromiseReject;
    (promise: SlowPromise): SlowPromiseReject;
}


interface SlowPromiseReject {
    (value?: any): void;
    $slow: {
        type: SlowType;
        id?: string;
        promise: SlowPromise;
    };
}


SlowPromiseReject = <any> makeCallableClass({

    // TODO: doc...
    constructor: function (promise: SlowPromise) {

        // Add slow metadata to the resolve function.
        this.$slow = { type: SlowType.SlowPromiseReject, promise };

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    // TODO: doc...
    call: function (reason?: any) {

        // As per spec, do nothing if promise's fate is already resolved.
        var promise: SlowPromise = this.$slow.promise;
        if (promise.$slow.isFateResolved) return;

        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;

        // Synchronise with the persistent object graph.
        storage.updated(promise);

        // Finally, reject the promise using its own private _reject method.
        promise._reject(reason);
    }
});


// Tell storage how to create a SlowPromiseReject instance.
storage.registerSlowObjectFactory(SlowType.SlowPromiseReject, $slow => {
    var reject = new SlowPromiseReject(null);
    reject.$slow = <any> $slow;
    return reject;
});
