import Types = require("slownode-prev");
import settings = require("../../settings");
import toStorable = require("./toStorable");
export = add;

function add(slowFunction: Types.SlowFunction) {
    var storableFunc = toStorable(slowFunction);
    slowFunction.id = storableFunc.id;

    return settings.connection("function").insert(storableFunc);
}
