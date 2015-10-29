// TODO: BUG: normal subclassing does not work for callable classes.
// - default constructor injects a `super()` call, but needs to do a `return super()` instead
// - subclasses 'call' method is always bound to `this` of the base class
// Remaining advantages of this approach?
// - can use instanceof (but there are alternatives to this, like an isXXX method somewhere)
// - created callable instances have a prototype that is useable for whatever
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
function makeCallableClass(options) {
    function CallableClass() {
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
        Object.setPrototypeOf(Callable, CallableClass.prototype);
        Callable.apply = function (thisArg, argsArray) { return options.call.apply(options.bindThis ? Callable : thisArg, argsArray); };
        var instance = options.constructor.apply(Callable, args) || Callable;
        return instance;
    }
    ;
    return CallableClass;
}
module.exports = makeCallableClass;
//# sourceMappingURL=makeCallableClass.js.map