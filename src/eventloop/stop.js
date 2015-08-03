var SlowNode = require("../index");
function stop() {
    if (SlowNode.flushCallback)
        clearTimeout(SlowNode.flushCallback);
}
;
module.exports = stop;
//# sourceMappingURL=stop.js.map