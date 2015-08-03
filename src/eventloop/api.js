var store = require("../store/eventLoop");
var processEvent = require("./calls/run");
var EventLoop = {
    call: store.call,
    run: processEvent,
    remove: store.remove,
    getNext: store.getNext,
};
module.exports = EventLoop;
//# sourceMappingURL=api.js.map