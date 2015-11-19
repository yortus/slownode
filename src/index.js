var assert = require('assert');
var persistence = require('./persistence');
var Epoch = require('./epochs/epoch');
var slowEventLoop = require('./eventLoop/slowEventLoop');
var api = {};
// TODO: ...
api.run = function (code, epochId) {
    return new Epoch(code, epochId);
};
// TODO: ...
api.weakRef = function (obj) {
    persistence.weakRef(obj);
};
// TODO: ...
api.on = function (eventId, handler) {
    assert(eventId === 'end');
    slowEventLoop.addExitHandler(handler);
};
// TODO: ...
api.Epoch = Epoch;
// TODO: temp testing
global['EPOCH'] = '<NO-EPOCH>';
module.exports = api;
//# sourceMappingURL=index.js.map