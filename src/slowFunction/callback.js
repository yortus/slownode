var store = require("../store/index");
function callback(functionId) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var opts = {
        arguments: args,
        runAt: 0
    };
    return store
        .addCall(functionId, opts)
        .then(function (ids) { return ids[0]; });
}
module.exports = callback;
//# sourceMappingURL=callback.js.map