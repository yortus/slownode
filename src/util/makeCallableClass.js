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
        CallableConstructor.prototype.apply = function (thisArg, argsArray) { return options.call.apply(thisArg, argsArray); };
        CallableConstructor.prototype.bind = function (thisArg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return (_a = options.call).bind.apply(_a, [thisArg].concat(args));
            var _a;
        };
        CallableConstructor.prototype.call = function (thisArg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return (_a = options.call).call.apply(_a, [thisArg].concat(args));
            var _a;
        };
        var instance = options.constructor.apply(Callable, args) || Callable;
        return instance;
    };
}
module.exports = makeCallableClass;
//# sourceMappingURL=makeCallableClass.js.map