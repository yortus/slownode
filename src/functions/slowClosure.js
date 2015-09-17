var makeCallableClass = require('../util/makeCallableClass');
var storage = require('../storage/storage');
/**
 * Create a SlowPromiseReject callable instance.
 * It may be called to reject the given promise with a reason.
 */
var SlowClosure = makeCallableClass({
    // TODO: doc...
    constructor: function (env, fn) {
        // TODO: Ensure `fn` is relocatable with the exception of names in env
        // TODO: this won't work in strict mode. Will need to do it another way eventually (ie via eval)...
        var functionSource = fn.toString();
        eval("with (env) fn = " + fn.toString() + ";");
        this.function = fn;
        this.$slow = {
            type: 50 /* SlowClosure */,
            functionSource: functionSource,
            environment: env
        };
        // Synchronise with the persistent object graph.
        storage.created(this);
    },
    // TODO: doc...
    call: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this.function.apply(void 0, args);
    },
    bindThis: true
});
// Tell storage how to create a SlowPromiseReject instance.
storage.registerSlowObjectFactory(50 /* SlowClosure */, function ($slow) {
    var closure = new SlowClosure($slow.environment, $slow.functionSource);
    return closure;
});
module.exports = SlowClosure;
//# sourceMappingURL=slowClosure.js.map