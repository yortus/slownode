var store = require("../store/eventLoop");
var processEvent = require("./calls/run");
var EventLoop = {
    add: store.add,
    run: processEvent,
    remove: store.remove,
    getNext: store.getNext,
};
module.exports = EventLoop;
//# sourceMappingURL=api.js.map