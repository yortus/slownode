import Types = require("slownode");
import SlowNode = require("../../index");
export = get;

function get(functionId: string): Promise<Types.Schema.Function> {
	return SlowNode.connection("function")
		.select()
		.where("id", "=", functionId)
}