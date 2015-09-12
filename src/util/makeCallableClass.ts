export = makeCallableClass;


function makeCallableClass<T extends Function>(options: { constructor: Function, call: T }): { new(...args): T; } {
    return <any> function CallableConstructor(...args) {
        function Callable(...args) {
            options.call.apply(Callable, args);
        }
        Callable['__proto__'] = CallableConstructor.prototype;
        options.constructor.apply(Callable, args);
        return Callable;
    };
}
