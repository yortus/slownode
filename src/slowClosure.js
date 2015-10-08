var _ = require('lodash');
var SlowLog = require('./slowLog');
var makeCallableClass = require('./util/makeCallableClass');
var isRelocatableFunction = require('./util/isRelocatableFunction');
var storage = require('./storage/storage');
/**
 * Creates a SlowClosure instance. It may be called with or without `new`.
 * A slow closure combines a function and a referencing environment. Calling
 * a slow closure causes its function to be executed with its environment
 * bindings added to its scope chain.
 */
var SlowClosure;
// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowClosure = makeCallableClass({
    // Creates a new SlowClosure instance.
    constructor: function (env, fn) {
        // Ensure `fn` is relocatable with the exception of names in `env`.
        if (!isRelocatableFunction(fn, _.keys(env))) {
            throw new Error("SlowClosure: function is not relocatable: " + fn);
        }
        // TODO: this won't work in strict mode. Will need to do it another way eventually (ie via eval)...
        // TODO: use 'vm' module
        var functionSource = fn.toString();
        eval("with (env) fn = " + fn.toString() + ";");
        this.function = fn;
        this.$slow = {
            kind: 50 /* Closure */,
            functionSource: functionSource,
            environment: env
        };
        // Synchronise with the persistent object graph.
        storage.created(this);
    },
    // Calling the SlowClosure executes the function passed to the constructor in the environment passed to the constructor.
    call: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this.function.apply(void 0, args);
    },
    // Ensure calls to apply() leave the `this` binding unchanged.
    bindThis: true
});
// Set the static '$slowLog' property on the SlowClosure callable class.
SlowClosure.$slowLog = SlowLog.none;
// Tell storage how to create a SlowClosure instance.
storage.registerSlowObjectFactory(50 /* Closure */, function ($slow) {
    var closure = new SlowClosure($slow.environment, $slow.functionSource);
    return closure;
});
module.exports = SlowClosure;
//# sourceMappingURL=slowClosure.js.map