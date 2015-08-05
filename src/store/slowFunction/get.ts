import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;
export = get;

function get(functionId: string): Promise<Types.Schema.Function> {
	return db("function")
		.select()
		.where("id", "=", functionId)
}