export = makeCallableClass;


/**
 * TODO: doc...
 * @param options
 */
function makeCallableClass<T extends Function>(options: CallableClassOptions<T>): { new(...args): T; } {
    return <any> function CallableConstructor(...args) {
        function Callable(...args) {
            return options.call.apply(Callable, args);
        }
        Callable['__proto__'] = CallableConstructor.prototype;
        Callable.apply = (thisArg, argsArray) => options.call.apply(options.bindThis ? Callable : thisArg, argsArray);
        var instance = options.constructor.apply(Callable, args) || Callable;
        return instance;
    };
}


/** TODO: doc... */
interface CallableClassOptions<T extends Function> {

    constructor: Function;

    call: T;

    bindThis?: boolean
}
