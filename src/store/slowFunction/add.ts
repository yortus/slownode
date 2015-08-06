import Types = require("slownode");
import SlowNode = require("../../index");
import toStorable = require("./toStorable");
export = add;

function add(slowFunction: Types.ISlowFunction) {
	var storableFunc = toStorable(slowFunction);
	slowFunction.id = storableFunc.id;

	return SlowNode.connection("function").insert(storableFunc);
}