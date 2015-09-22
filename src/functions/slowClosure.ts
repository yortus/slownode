import _ = require('lodash');
import SlowType = require('../slowType');
import makeCallableClass = require('../util/makeCallableClass');
import isRelocatableFunction = require('./isRelocatableFunction');
import storage = require('../storage/storage');
export = SlowClosure;


// TODO: temp testing...
interface SlowClosureStatic {
    new(env: { [name: string]: any; }, fn: Function): SlowClosure;
    (env: { [name: string]: any; }, fn: Function): SlowClosure;
}

interface SlowClosure {
    (...args): any;
    function: Function;
    $slow: {
        type: SlowType;
        id?: string;
        functionSource: string;
        environment: { [name: string]: any; };
    }
}


/**
 * Create a SlowPromiseReject callable instance.
 * It may be called to reject the given promise with a reason.
 */
var SlowClosure: SlowClosureStatic = <any> makeCallableClass({

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
