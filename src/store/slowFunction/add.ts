import Types = require("slownode");
import settings = require("../../settings");
import toStorable = require("./toStorable");
export = add;

function add(slowFunction: Types.ISlowFunction) {
    var storableFunc = toStorable(slowFunction);
    slowFunction.id = storableFunc.id;

    return settings.connection("function").insert(storableFunc);
}
