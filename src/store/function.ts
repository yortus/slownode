import Types = require("slownode");
import toStorable = require("../function/toStorable");
import { connection as db } from "../index";

export function add(slowFunction: Types.SlowFunction): Promise<string> {
	var storableFunc = toStorable(slowFunction);

	return db("function")
		.insert(storableFunc)
		.then(ids => ids[0]);
}

export function get(functionId: string): Promise<Types.Schema.Function> {
	return db("function")
		.select()
		.where("id", "=", functionId)
		.then(rows => rows[0]);
}

