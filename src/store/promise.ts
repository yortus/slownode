import SlowNode = require("../index");

export function get(id: number) {
	return SlowNode.connection("promise")
		.select()
		.where("id", "=", id)
		.then(promises => promises[0]);
}

