var SlowNode = require("../../index");
var toStorable = require("./toStorable");
function add(slowFunction) {
    var storableFunc = toStorable(slowFunction);
    return SlowNode.connection("function").insert(storableFunc);
}
module.exports = add;
//# sourceMappingURL=add.js.map