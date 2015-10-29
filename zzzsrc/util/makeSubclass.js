var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// TODO: doc...
function makeSubClass(SuperClass, slowLog) {
    // TODO: temp testing... do we really need caching? See comment below...
    var cache = slowLog['cache'] || (slowLog['cache'] = new Map());
    // Return the cached constructor if one has already been created.
    var cached = cache.get(SuperClass);
    if (cached) {
        // TODO: never entered so far. Really need caching?
        return cached;
    }
    // TODO: TS workaround, see https://github.com/Microsoft/TypeScript/issues/5163
    var Super = SuperClass;
    // TODO: 'normal' subclass but NB 'return super'...
    var Sub = (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return _super.apply(this, args);
        }
        return class_1;
    })(Super);
    // TODO: set slowLog...
    Sub.prototype.$slowLog = slowLog;
    // Cache and return the constructor function.
    cache.set(SuperClass, Sub);
    return Sub;
}
module.exports = makeSubClass;
//# sourceMappingURL=makeSubClass.js.map