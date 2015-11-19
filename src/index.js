var assert = require('assert');
var persistence = require('./persistence');
var Epoch = require('./epochs/epoch');
var slowEventLoop = require('./eventLoop/slowEventLoop');
var api = {};
// TODO: ...
api.run = function (epochId, code) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return new (Epoch.bind.apply(Epoch, [void 0].concat([epochId, code], args)))();
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