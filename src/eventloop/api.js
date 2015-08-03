var store = require("../store/eventLoop");
var processEvent = require("./calls/run");
var EventLoop = {
    add: store.add.bind(this),
    run: processEvent.bind(this),
    remove: store.remove.bind(this),
    getNext: store.getNext.bind(this),
};
module.exports = EventLoop;
//# sourceMappingURL=api.js.map