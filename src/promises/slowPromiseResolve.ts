import types = require('./types');
import SlowType = require('../slowType');
import makeCallableClass = require('../util/makeCallableClass');
import standardResolutionProcedure = require('./standardResolutionProcedure');
import storage = require('../storage/storage');
export = SlowPromiseResolve;


// TODO: temp testing...
type SlowPromiseResolve  = types.SlowPromiseResolve;


/**
 * Create a SlowPromiseResolve callable instance.
 * It may be called to resolve the given promise with a value.
 */
var SlowPromiseResolve = <types.SlowPromiseResolveStatic> makeCallableClass({

    // TODO: doc...
    constructor: function (promise: types.SlowPromise) {

        // Add slow metadata to the resolve function.
        this.$slow = { type: SlowType.SlowPromiseResolve, promise };

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    // TODO: doc...
    call: function (value?: any) {

        // As per spec, do nothing if promise's fate is already resolved.
        var promise: types.SlowPromise = this.$slow.promise;
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
storage.registerSlowObjectFactory(SlowType.SlowPromiseResolve, $slow => {
    var resolve = new SlowPromiseResolve(null);
    resolve.$slow = <any> $slow;
    return resolve;
});
