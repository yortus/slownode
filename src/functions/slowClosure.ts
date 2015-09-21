import _ = require('lodash');
import types = require('types');
import SlowType = types.SlowObject.Type;
import makeCallableClass = require('../util/makeCallableClass');
import isRelocatableFunction = require('./isRelocatableFunction');
import storage = require('../storage/storage');
export = SlowClosure;


/**
 * Create a SlowPromiseReject callable instance.
 * It may be called to reject the given promise with a reason.
 */
var SlowClosure: types.SlowClosureStatic = <any> makeCallableClass({

    // TODO: doc...
    constructor: function (env: { [name: string]: any; }, fn: Function|string) {

        // Ensure `fn` is relocatable with the exception of names in env
        if (!isRelocatableFunction(fn, _.keys(env))) {
            throw new Error(`slowClosure: function is not relocatable: ${fn}`);
        }

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
    var closure = new SlowClosure($slow.environment, $slow.functionSource);
    return closure;
});
