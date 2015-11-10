var _ = require('lodash');
var persistence = require('../persistence');
var makeCallableClass = require('../util/makeCallableClass');
var isRelocatableFunction = require('../util/isRelocatableFunction');
/**
 * Creates a SlowClosure instance. It may be called with or without `new`.
 * A slow closure combines a function and a referencing environment. Calling
 * a slow closure causes its function to be executed with its environment
 * bindings added to its scope chain.
 */
var SlowClosure = slowClosureForEpoch(null);
// TODO: doc...
function slowClosureForEpoch(epochId) {
    // TODO: caching... NB can use a normal obj now that key is a string
    cache = cache || new Map();
    if (cache.has(epochId))
        return cache.get(epochId);
    // Create a constructor function whose instances (a) are callable and (b) work with instanceof.
    var result = makeCallableClass({
        // Creates a new SlowClosure instance.
        constructor: function (env, fn) {
            var self = this;
            // Ensure `fn` is relocatable with the exception of names in `env`.
            if (!isRelocatableFunction(fn, _.keys(env))) {
                throw new Error("SlowClosure: function is not relocatable: " + fn);
            }
            // TODO: this won't work in strict mode. Will need to do it another way eventually (ie via eval)...
            // TODO: use 'vm' module
            // TODO: delegate to util.evalInContext...
            var functionSource = fn.toString();
            eval("with (env) fn = " + fn.toString() + ";");
            self.function = fn;
            self.$slow = {
                kind: 400 /* Closure */,
                epochId: epochId,
                id: null,
                functionSource: functionSource,
                environment: env
            };
            // Synchronise with the persistent object graph.
            persistence.created(self); // TODO: temp testing...
        },
        // Calling the SlowClosure executes the function passed to the constructor in the environment passed to the constructor.
        call: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var self = this;
            return self.function.apply(void 0, args);
        },
        // Ensure calls to apply() leave the `this` binding unchanged.
        bindThis: true
    });
    // TODO: ...
    result.forEpoch = slowClosureForEpoch;
    // TODO: caching...
    cache.set(epochId, result);
    return result;
}
// TODO: ... NB can use a normal obj now that key is a string
var cache;
// TODO: ==================== rehydration logic... temp testing... ====================
persistence.howToRehydrate(400 /* Closure */, function ($slow) {
    var Closure = slowClosureForEpoch($slow.epochId);
    var closure = new Closure($slow.functionSource, $slow.environment);
    return closure;
});
module.exports = SlowClosure;
//# sourceMappingURL=slowClosure.js.map