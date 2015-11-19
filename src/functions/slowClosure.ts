import _ = require('lodash');
import SlowKind = require('../slowKind');
import persistence = require('../persistence');
import makeCallableClass = require('../util/makeCallableClass');
import isRelocatableFunction = require('../util/isRelocatableFunction');
export = SlowClosure;


/**
 * Creates a SlowClosure instance. It may be called with or without `new`.
 * A slow closure combines a function and a referencing environment. Calling
 * a slow closure causes its function to be executed with its environment
 * bindings added to its scope chain.
 */
var SlowClosure: SlowClosureStatic = <any> makeCallableClass({

    // Creates a new SlowClosure instance.
    constructor: function (env: { [name: string]: any; }, fn: Function|string) {
        var self: SlowClosure = this;

        // Ensure `fn` is relocatable with the exception of names in `env`.
        if (!isRelocatableFunction(fn, _.keys(env))) {
            throw new Error(`SlowClosure: function is not relocatable: ${fn}`);
        }

        // TODO: this won't work in strict mode. Will need to do it another way eventually (ie via eval)...
        // TODO: use 'vm' module
        // TODO: delegate to util.evalInContext...
        var functionSource = fn.toString();
        eval(`with (env) fn = ${fn.toString()};`);

        self.function = <Function> fn;
        self.$slow = {
            kind: SlowKind.Closure,
            id: null,
            functionSource,
            environment: env
        };

        // Synchronise with the persistent object graph.
        persistence.created(self); // TODO: temp testing...
    },

    // Calling the SlowClosure executes the function passed to the constructor in the environment passed to the constructor.
    call: function (...args: any[]) {
        var self: SlowClosure = this;
        return self.function.apply(void 0, args);
    },

    // Ensure calls to apply() leave the `this` binding unchanged.
    bindThis: true
});


// TODO: doc...
interface SlowClosureStatic {

    /** Creates a new SlowClosure instance. */
    new(env: { [name: string]: any; }, fn: Function): SlowClosure;

    /** Creates a new SlowClosure instance. */
    (env: { [name: string]: any; }, fn: Function): SlowClosure;

    /** TODO: doc... */
    forEpoch(epochId: string): SlowClosureStatic;
}


// TODO: doc...
interface SlowClosure {

    /** Calling the SlowClosure executes the function passed to the constructor in the environment passed to the constructor. */
    (...args): any;

    /** INTERNAL holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data. */
    $slow: {
        kind: SlowKind;
        id: string;
        functionSource: string;
        environment: { [name: string]: any; };
    }

    /** INTERNAL property holding the function that is executed when the closure instance is invoked. */
    function: Function;
}


// TODO: ==================== rehydration logic... temp testing... ====================
persistence.howToRehydrate(SlowKind.Closure, $slow => {
    var closure = new SlowClosure((<any> $slow).environment, (<any> $slow).functionSource);
    return closure;
});
