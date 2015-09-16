import types = require('types');
import SlowType = types.SlowObject.Type;
import makeCallableClass = require('../util/makeCallableClass');
import storage = require('../storage/storage');
export = SlowClosure;


/**
 * Create a SlowPromiseReject callable instance.
 * It may be called to reject the given promise with a reason.
 */
var SlowClosure: types.SlowClosureStatic = <any> makeCallableClass({

    // TODO: doc...
    constructor: function (fn: Function, env: { [name: string]: any; }) {

        // TODO: this won't work in strict mode. Will need to do it another way eventually (ie via eval)...
        var func = eval(`with (env) ${fn.toString()}`);

        this.$slow = {
            type: SlowType.SlowClosure,
            func,
            env
        };
    },

    // TODO: doc...
    call: function (...args: any[]) {
        var func = this.$slow.func;
        var env = this.$slow.env;
    }
});


// Tell storage how to create a SlowPromiseReject instance.
storage.registerSlowObjectFactory(SlowType.SlowClosure, $slow => {
    var closure = new SlowClosure(null, null);
    closure.$slow = <any> $slow;
    return closure;
});
