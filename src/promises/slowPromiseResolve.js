var makeCallableClass = require('../util/makeCallableClass');
var standardResolutionProcedure = require('./standardResolutionProcedure');
var storage = require('../storage/storage');
/**
 * Create a SlowPromiseResolve callable instance.
 * It may be called to resolve the given promise with a value.
 */
var SlowPromiseResolve = makeCallableClass({
    // TODO: doc...
    constructor: function (promise) {
        // Add slow metadata to the resolve function.
        this._slow = { type: 11 /* SlowPromiseResolve */, promise: promise };
        // Synchronise with the persistent object graph.
        storage.created(this);
    },
    // TODO: doc...
    call: function (value) {
        // As per spec, do nothing if promise's fate is already resolved.
        var promise = this._slow.promise;
        if (promise._slow.isFateResolved)
            return;
        // Indicate the promise's fate is now resolved.
        promise._slow.isFateResolved = true;
        // Synchronise with the persistent object graph.
        storage.updated(promise);
        // Finally, resolve the promise using the standard resolution procedure.
        standardResolutionProcedure(promise, value);
    }
});
module.exports = SlowPromiseResolve;
//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowPromiseResolveFunction,
//    dehydrate: (p: types.SlowPromise.ResolveFunction, recurse: (obj) => any) => {
//        if (!p || !p._slow || p._slow.type !== SlowType.SlowPromiseResolveFunction) return;
//        var jsonSafeObject = _.mapValues(p._slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => {
//        return create(jsonSafeObject.promise, false);
//    }
//});
//# sourceMappingURL=slowPromiseResolve.js.map