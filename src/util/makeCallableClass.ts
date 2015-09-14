export = makeCallableClass;


function makeCallableClass<T extends Function>(options: { constructor: Function, call: T }): { new(...args): T; } {
    return <any> function CallableConstructor(...args) {
        function Callable(...args) {
            return options.call.apply(Callable, args);
        }
        Callable['__proto__'] = CallableConstructor.prototype;
        CallableConstructor.prototype.apply = (thisArg, argsArray) => options.call.apply(thisArg, argsArray);
        CallableConstructor.prototype.bind = (thisArg, ...args) => options.call.bind(thisArg, ...args);
        CallableConstructor.prototype.call = (thisArg, ...args) => options.call.call(thisArg, ...args);
        var instance = options.constructor.apply(Callable, args) || Callable;
        return instance;
    };
}
