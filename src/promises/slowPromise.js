var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SlowPromise = (function () {
    function SlowPromise() {
    }
    SlowPromise.forEpoch = function () {
    };
    return SlowPromise;
})();
var Derived = (function (_super) {
    __extends(Derived, _super);
    function Derived() {
        _super.apply(this, arguments);
    }
    Derived.resolved = function () {
        _super.forEpoch;
    };
    return Derived;
})(SlowPromise);
module.exports = SlowPromise;
//# sourceMappingURL=slowPromise.js.map