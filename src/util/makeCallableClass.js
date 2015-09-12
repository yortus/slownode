function makeCallableClass(options) {
    return function CallableConstructor() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        function Callable() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            options.call.apply(Callable, args);
        }
        Callable['__proto__'] = CallableConstructor.prototype;
        options.constructor.apply(Callable, args);
        return Callable;
    };
}
module.exports = makeCallableClass;
//# sourceMappingURL=makeCallableClass.js.map