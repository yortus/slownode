import SlowNode = require("../../index");
import Types = require("slownode");
export = add;

function add(promise: Types.Schema.Promise) {
	// State validation?
	
	return SlowNode
		.connection("promise")
		.insert(promise);
}