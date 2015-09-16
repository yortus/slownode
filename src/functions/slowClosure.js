var makeCallableClass = require('../util/makeCallableClass');
var storage = require('../storage/storage');
/**
 * Create a SlowPromiseReject callable instance.
 * It may be called to reject the given promise with a reason.
 */
var SlowClosure = makeCallableClass({
    // TODO: doc...
    constructor: function (fn, env) {
        // TODO: this won't work in strict mode. Will need to do it another way eventually (ie via eval)...
        var func = eval("(with (env) (" + fn.toString() + "))");
        this.$slow = {
            type: 50 /* SlowClosure */,
            func: func,
            env: env
        };
    },
    // TODO: doc...
    call: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var func = this.$slow.func;
        var env = this.$slow.env;
    }
});
// Tell storage how to create a SlowPromiseReject instance.
storage.registerSlowObjectFactory(50 /* SlowClosure */, function ($slow) {
    var closure = new SlowClosure(null, null);
    closure.$slow = $slow;
    return closure;
});
module.exports = SlowClosure;
//# sourceMappingURL=slowClosure.js.map