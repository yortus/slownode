import Types = require("slownode");
import SlowNode = require("../../index");
export = add;

function add(listener: Types.Schema.EventListener) {
	return SlowNode.connection("listener")
		.insert(listener);
}