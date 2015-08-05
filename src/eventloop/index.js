var store = require("../store/index");
exports.add = store.addCall;
exports.exec = require("./exec");
exports.remove = store.removeCall;
exports.getNext = store.nextCall;
exports.flush = require("./runLoop");
//# sourceMappingURL=index.js.map