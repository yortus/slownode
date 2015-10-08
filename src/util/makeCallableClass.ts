export = makeCallableClass;


/**
 * Creates a constructor function whose instances (1) are callable
 * and (2) have the constructor function as their prototype. Normally JS
 * allows only one or the other of these properties but not both. Having
 * both is desirable in situations where you want to be able to create
 * callable instances (ie functions) with a particular prototype, so they
 * work with instanceof etc.
 * Performance warning: this function uses ES6's Object.setPrototypeOf()
 * by necessity, so instances created this way may not be optimizable by V8.
 * More info at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
 */
function makeCallableClass<T extends Function>(options: CallableClassOptions<T>): { new(...args): T; } {
    function CallableClass(...args) {
        function Callable(...args) {
            return options.call.apply(Callable, args);
        }
        (<any> Object).setPrototypeOf(Callable, CallableClass.prototype);
        Callable.apply = (thisArg, argsArray) => options.call.apply(options.bindThis ? Callable : thisArg, argsArray);
        var instance = options.constructor.apply(Callable, args) || Callable;
        return instance;
    };

    return <any> CallableClass;
}


/** Options for makeCallableClass */
interface CallableClassOptions<T extends Function> {

    /** Defines the constructor logic that is applied to each callable instance created. */
    constructor: Function;

    /** Defines the body of code to be executed when a callable instance is called. */
    call: T;

    /**
     * Specifies whether calls to apply() on an instance ignore the supplied thisArg or not.
     * If `bindThis` is set to true, the `thisArg` value in apply() calls is ignored, and
     * the callable instance itself is unconditionally used as the `thisArg` value.
     */
    bindThis?: boolean
}
