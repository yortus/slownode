import Types = require("slownode");
import SlowNode = require("../../index");
import toStorable = require("./toStorable");
export = add;

function add(slowFunction: Types.SlowFunction) {
	var storableFunc = toStorable(slowFunction);

	return SlowNode.connection("function").insert(storableFunc);
}