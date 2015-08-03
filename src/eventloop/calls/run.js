var SlowNode = require("../../index");
function run(functionCall) {
    if (!functionCall) {
        SlowNode.flushCallback = setTimeout(function () { return SlowNode.flush(); }, SlowNode.configuration.pollIntervalMs);
        return Promise.resolve(true);
    }
    var runPromise = Promise.resolve(true);
    return runPromise;
}
;
module.exports = run;
//# sourceMappingURL=run.js.map