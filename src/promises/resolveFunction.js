var standardResolutionProcedure = require('./standardResolutionProcedure');
var storage = require('../storage/storage');
var makeCallableClass = require('../util/makeCallableClass');
/**
 * Create a SlowPromiseResolveFunction callable instance.
 * It may be called to resolve the given promise with a value.
 */
var SlowPromiseResolveFunction = makeCallableClass(construct, call);
function construct(promise) {
    // Add slow metadata to the resolve function.
    this._slow = { type: 11 /* SlowPromiseResolveFunction */, promise: promise };
    // Synchronise with the persistent object graph.
    // TODO: refactor this getting rid of conditional 'persist'
    storage.created(this);
}
function call(value) {
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
module.exports = SlowPromiseResolveFunction;
///**
// * Returns a new SlowPromiseResolveFunction instance.
// * This function may be used to resolve the given promise with a value.
// */
//export function create(promise: types.SlowPromise, persist = false) {
//    // Create a function that resolves the given promise with the given value.
//    var resolve: types.SlowPromise.ResolveFunction = <any> function resolveSlowPromise(value?: any) {
//        // As per spec, do nothing if promise's fate is already resolved.
//        if (promise._slow.isFateResolved) return;
//        // Indicate the promise's fate is now resolved.
//        promise._slow.isFateResolved = true;
//        // Synchronise with the persistent object graph.
//        storage.updated(promise);
//        // Finally, resolve the promise using the standard resolution procedure.
//        standardResolutionProcedure(promise, value);
//    };
//    // Add slow metadata to the resolve function.
//    resolve._slow = { type: SlowType.SlowPromiseResolveFunction, promise };
//    // Synchronise with the persistent object graph.
//    // TODO: refactor this getting rid of conditional 'persist'
//    if (persist) storage.created(resolve);
//    // Return the resolve function.
//    return resolve;
//}
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
//# sourceMappingURL=resolveFunction.js.map