var self = require("../../index");
function run(event) {
    if (!event) {
        self.flushCallback = setTimeout(function () { return self.flush(); }, self.configuration.pollIntervalMs);
        return Promise.resolve(true);
    }
    var runPromise = Promise.resolve(true);
    return runPromise;
}
;
module.exports = run;
//# sourceMappingURL=run.js.map