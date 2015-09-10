export = makeCallableClass;


function makeCallableClass<T extends Function>(ctorBody: Function, callBody: Function): { new(...args): T; } {
    return <any> function CallableConstructor(...args) {
        function Callable(...args) {
            callBody.apply(this, args);
        }
        Callable['__proto__'] = CallableConstructor.prototype;
        ctorBody.apply(Callable, args);
        return Callable;
    };
}
