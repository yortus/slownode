var SlowNode = require("../../index");
var db = SlowNode.connection;
function add(functionId, options) {
    options = options || {};
    if (typeof options.arguments !== "string")
        options.arguments = JSON.stringify(options.arguments || []);
    var storable = toStorableCall(functionId, options);
    return db("eventLoop")
        .insert(storable);
}
function toStorableCall(functionId, options) {
    var options = options || {};
    var runAt = options.runAt || 0;
    var runAtReadable = new Date(runAt).toString();
    options.arguments = options.arguments || {};
    return {
        funcId: functionId,
        runAt: runAt,
        runAtReadable: runAtReadable,
        arguments: JSON.stringify(options.arguments)
    };
}
module.exports = add;
//# sourceMappingURL=add.js.map