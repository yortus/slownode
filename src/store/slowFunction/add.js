var SlowNode = require("../../index");
var db = SlowNode.connection;
var toStorable = require("./toStorable");
function add(slowFunction) {
    var storableFunc = toStorable(slowFunction);
    return db("function").insert(storableFunc);
}
module.exports = add;
//# sourceMappingURL=add.js.map