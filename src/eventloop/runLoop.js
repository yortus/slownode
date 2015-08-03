var EventLoop = require("./index");
function runLoop() {
    // TODO: Retry/failure handling
    EventLoop
        .getNext()
        .then(EventLoop.exec);
}
;
module.exports = runLoop;
//# sourceMappingURL=runLoop.js.map