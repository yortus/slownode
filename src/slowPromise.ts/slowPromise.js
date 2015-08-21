var Types = require("slownode");
var slowAsyncFunction = require("../slowAsyncFunction/slowAsyncFunction");
var SlowPromise = (function () {
    function SlowPromise(resolver) {
        var _this = this;
        this._id = 0;
        this._functionId = 0;
        this._state = 0 /* Pending */;
        this.then = function (fn) {
            return _this;
        };
        var slowResolver = slowAsyncFunction(resolver);
    }
    return SlowPromise;
})();
function createResolve(slowPromise) {
}
function createReject(slowPromise) {
    return null;
}
//# sourceMappingURL=slowPromise.js.map