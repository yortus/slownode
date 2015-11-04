var EpochLog = require('./epochLog');
var slowEventLoop = require('./eventLoop/slowEventLoop');
var slowTimers = require('./eventLoop/slowTimers');
var SlowPromise = require('./promises/slowPromise');
var SlowClosure = require('./closures/slowClosure');
var SlowAsyncFunction = require('./asyncFunctions/slowAsyncFunction');
var Epoch = (function () {
    // TODO: take a filename
    function Epoch() {
        var _this = this;
        // TODO: explicit disposal...
        // TODO: temp testing...
        this.log = new EpochLog();
        // TODO: temp testing...
        this.setTimeout = slowTimers.setTimeout.forEpoch(this.log);
        // TODO: temp testing...
        this.clearTimeout = slowTimers.clearTimeout;
        // TODO: temp testing...
        this.Promise = SlowPromise.forEpoch(this.log);
        // TODO: temp testing...
        this.closure = SlowClosure.forEpoch(this.log);
        // TODO: temp testing...
        this.async = makeAsyncFunctionForEpoch(this);
        // TODO: need orderly attach/detach in pairs. This will never be detached!! And will keep ref to epoch/log alive!
        slowEventLoop.beforeNextTick.attach(function () {
            _this.log.flush();
            return Promise.resolve();
        });
    }
    return Epoch;
})();
// TODO: temp testing...
function makeAsyncFunctionForEpoch(epoch) {
    var async = SlowAsyncFunction.forEpoch(epoch.log);
    var options = { require: require };
    var result = function (bodyFunc) { return async(bodyFunc, options); };
    return result;
    function require(moduleId) {
        if (moduleId === 'epoch')
            return epoch;
        return mainRequire(moduleId);
    }
}
// TODO: temp testing...
var mainRequire = require.main.require;
module.exports = Epoch;
//# sourceMappingURL=epoch.js.map