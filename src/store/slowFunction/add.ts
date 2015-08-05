import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;
import toStorable = require("./toStorable");
export = add;

function add(slowFunction: Types.SlowFunction) {
	var storableFunc = toStorable(slowFunction);

	return db("function").insert(storableFunc);
}