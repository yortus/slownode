var settings = require("../../settings");
var toStorable = require("./toStorable");
function add(slowFunction) {
    var storableFunc = toStorable(slowFunction);
    slowFunction.id = storableFunc.id;
    return settings.connection("function").insert(storableFunc);
}
module.exports = add;
//# sourceMappingURL=add.js.map