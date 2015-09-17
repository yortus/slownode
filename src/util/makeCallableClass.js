/**
 * TODO: doc...
 * @param options
 */
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
            return options.call.apply(Callable, args);
        }
        Callable['__proto__'] = CallableConstructor.prototype;
        Callable.apply = function (thisArg, argsArray) { return options.call.apply(options.bindThis ? Callable : thisArg, argsArray); };
        var instance = options.constructor.apply(Callable, args) || Callable;
        return instance;
    };
}
module.exports = makeCallableClass;
//# sourceMappingURL=makeCallableClass.js.map