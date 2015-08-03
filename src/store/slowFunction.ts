import Types = require("slownode");
import toStorable = require("../slowFunction/toStorable");
import SlowNode = require("../index");

export function add(slowFunction: Types.SlowFunction): Promise<string> {
	var storableFunc = toStorable(slowFunction);

	return SlowNode.connection("function")
		.insert(storableFunc)
		.then(ids => ids[0]);
}

export function get(functionId: string): Promise<Types.Schema.Function> {
	return SlowNode.connection("function")
		.select()
		.where("id", "=", functionId)
		.then(rows => rows[0]);
}

