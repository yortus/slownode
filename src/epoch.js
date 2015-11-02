var EpochLog = require('./epochLog');
var slowTimers = require('./eventLoop/slowTimers');
var slowEventLoop = require('./eventLoop/slowEventLoop');
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
        // TODO: need orderly attach/detach in pairs. This will never be detached!! And will keep ref to epoch/log alive!
        slowEventLoop.beforeNextTick.attach(function () {
            _this.log.flush();
            return Promise.resolve();
        });
    }
    return Epoch;
})();
module.exports = Epoch;
//# sourceMappingURL=epoch.js.map