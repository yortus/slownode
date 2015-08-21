var slowAsyncFunction = require("../slowAsyncFunction/slowAsyncFunction");
var SlowPromise = (function () {
    function SlowPromise(resolver) {
        var _this = this;
        this.id = 0;
        this.functionId = 0;
        this.then = function (fn) {
            return _this;
        };
        var slowResolver = slowAsyncFunction(resolver);
    }
    return SlowPromise;
})();
function createResolve(slowPromise) {
    return slowAsyncFunction(function (value) {
    });
}
function createReject(slowPromise) {
    return null;
}
//# sourceMappingURL=slowPromise.js.map