import _ = require('lodash');
import SlowKind = require('./slowKind');
import SlowLog = require('./slowLog');
import makeCallableClass = require('./util/makeCallableClass');
import isRelocatableFunction = require('./util/isRelocatableFunction');
import storage = require('./storage/storage');
export = SlowClosure;


/**
 * Creates a SlowClosure instance. It may be called with or without `new`.
 * A slow closure combines a function and a referencing environment. Calling
 * a slow closure causes its function to be executed with its environment
 * bindings added to its scope chain.
 */
var SlowClosure: {

    /** Creates a new SlowClosure instance. */
    new(env: { [name: string]: any; }, fn: Function): SlowClosure;

    /** Creates a new SlowClosure instance. */
    (env: { [name: string]: any; }, fn: Function): SlowClosure;

    /** INTERNAL the SlowLog used by all instances created by this constructor. */
    $slowLog: SlowLog;

    /** INTERNAL returns a SlowClosure constructor function whose instances are bound to the given SlowLog. */
    logged(log: SlowLog): typeof SlowClosure;
}
interface SlowClosure {

    /** Calling the SlowClosure executes the function passed to the constructor in the environment passed to the constructor. */
    (...args): any;

    /** Holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data. */
    $slow: {
        kind: SlowKind;
        id?: string;
        functionSource: string;
        environment: { [name: string]: any; };
    }

    /** PRIVATE property holding the function that is executed when the closure instance is invoked. */
    function: Function;
}


// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowClosure = <any> makeCallableClass({

    // Creates a new SlowClosure instance.
    constructor: function (env: { [name: string]: any; }, fn: Function|string) {

        // Ensure `fn` is relocatable with the exception of names in `env`.
        if (!isRelocatableFunction(fn, _.keys(env))) {
            throw new Error(`SlowClosure: function is not relocatable: ${fn}`);
        }

        // TODO: this won't work in strict mode. Will need to do it another way eventually (ie via eval)...
        // TODO: use 'vm' module
        var functionSource = fn.toString();
        eval(`with (env) fn = ${fn.toString()};`);

        this.function = fn;
        this.$slow = {
            kind: SlowKind.Closure,
            functionSource,
            environment: env
        };

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    // Calling the SlowClosure executes the function passed to the constructor in the environment passed to the constructor.
    call: function (...args: any[]) {
        return this.function.apply(void 0, args);
    },

    // Ensure calls to apply() leave the `this` binding unchanged.
    bindThis: true
});


// Set the static '$slowLog' property on the SlowClosure callable class.
SlowClosure.$slowLog = SlowLog.none;


// Define the static `logged` method on the SlowClosure callable class.
SlowClosure.logged = (log: SlowLog) => {

    // Return the cached constructor if one has already been created.
    var cached = log['_SlowClosure'];
    if (cached) return cached;

    // Derive a new subclass of SlowClosure that is bound to the given slow log.
    class SlowClosureLogged extends SlowClosure {
        constructor(env, fn) { return <any> super(env, fn); }
        static $slowLog = log;
        static logged = SlowClosure.logged;
    };

    // Cache and return the constructor function.
    log['_SlowClosure'] = SlowClosureLogged;
    return SlowClosureLogged;
};


// Tell storage how to create a SlowPromiseReject instance.
storage.registerSlowObjectFactory(SlowKind.Closure, ($slow: any) => {
    var closure = new SlowClosure($slow.environment, $slow.functionSource);
    return closure;
});
