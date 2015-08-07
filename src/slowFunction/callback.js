var store = require("../store/index");
var deserialise = require("./deserialise");
function callback(functionId) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var opts = {
        arguments: args,
        runAt: 0
    };
    return store.getFunction(functionId)
        .then(deserialise)
        .then(function (func) { return func.body.apply(args); });
}
module.exports = callback;
//# sourceMappingURL=callback.js.map