var standardResolutionProcedure = require('./standardResolutionProcedure');
var storage = require('../storage/storage');
// TODO: temp testing...
var Callable = function (constructorFunction) {
    var C = function () {
        var obj = function () {
            C.prototype.call.apply(this, arguments);
        };
        obj['__proto__'] = C.prototype;
        constructorFunction.apply(obj, arguments);
        return obj;
    };
    return C;
};
function MyKindOfFunction(a, b, c) {
    console.log(a, b, c);
    this.prop = 'and a property value .prop';
}
var API = Callable(MyKindOfFunction);
//API.prototype.call = function (arg) {
//    console.log(arg);
//};
API.prototype.boss = function (arg) {
    console.log(arg, this.prop);
};
var a = new API(1, 2, 3);
a('.call() invocation');
a.boss('.boss() invocation');
/**
 * Returns a new SlowPromiseResolveFunction instance.
 * This function may be used to resolve the given promise with a value.
 */
function create(promise, persist) {
    if (persist === void 0) { persist = false; }
    // Create a function that resolves the given promise with the given value.
    var resolve = function resolveSlowPromise(value) {
        // As per spec, do nothing if promise's fate is already resolved.
        if (promise._slow.isFateResolved)
            return;
        // Indicate the promise's fate is now resolved.
        promise._slow.isFateResolved = true;
        // Synchronise with the persistent object graph.
        storage.updated(promise);
        // Finally, resolve the promise using the standard resolution procedure.
        standardResolutionProcedure(promise, value);
    };
    // Add slow metadata to the resolve function.
    resolve._slow = { type: 11 /* SlowPromiseResolveFunction */, promise: promise };
    // Synchronise with the persistent object graph.
    // TODO: refactor this getting rid of conditional 'persist'
    if (persist)
        storage.created(resolve);
    // Return the resolve function.
    return resolve;
}
exports.create = create;
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