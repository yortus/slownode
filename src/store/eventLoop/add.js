var SlowNode = require("../../index");
function add(functionId, options) {
    options = options || {};
    options.arguments = options.arguments || [];
    var storable = toStorableCall(functionId, options);
    return SlowNode.connection("eventLoop")
        .insert(storable);
}
function toStorableCall(functionId, options) {
    var options = options || {};
    var runAt = options.runAt || 0;
    var runAtReadable = new Date(runAt).toString();
    return {
        funcId: functionId,
        runAt: runAt,
        runAtReadable: runAtReadable,
        arguments: JSON.stringify(options.arguments)
    };
}
module.exports = add;
//# sourceMappingURL=add.js.map