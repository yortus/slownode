var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
function subclassTemp(SuperClass) {
    var SubClass = (function (_super) {
        __extends(SubClass, _super);
        function SubClass() {
            _super.apply(this, arguments);
        }
        return SubClass;
    })(SuperClass);
    return SubClass;
}
// TODO: doc...
function makeSubClass(SuperClass) {
    // TODO: hacky... see matching comment in makeCallableClass()
    if (SuperClass['isCallableClass']) {
        debugger;
    }
    //else {
    // Normal subclass...
    // TODO: see how TSC does it... __extends and all... 
    // TODO: eg...
    var SubClass = (function (_super) {
        __extends(SubClass, _super);
        function SubClass() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return _super.apply(this, args) || this;
        }
        return SubClass;
    })(SuperClass);
    return SubClass;
    //}
}
// TODO: from TSC1.6 emit
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
module.exports = makeSubClass;
//# sourceMappingURL=makeSubClass.js.map