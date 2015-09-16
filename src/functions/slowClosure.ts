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
    constructor: function (fn: Function|string, env: { [name: string]: any; }) {

        // Ensure `fn` is relocatable with the exception of names in env

        // TODO: this won't work in strict mode. Will need to do it another way eventually (ie via eval)...
        var functionSource = fn.toString();
        eval(`with (env) fn = ${fn.toString()};`);

        this.function = fn;
        this.$slow = {
            type: SlowType.SlowClosure,
            functionSource,
            environment: env
        };

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    // TODO: doc...
    call: function (...args: any[]) {
        return this.function.apply(void 0, args);
    },

    bindThis: true
});


// Tell storage how to create a SlowPromiseReject instance.
storage.registerSlowObjectFactory(SlowType.SlowClosure, ($slow: any) => {
    var closure = new SlowClosure($slow.functionSource, $slow.environment);
    return closure;
});
