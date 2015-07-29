import EventLoop = require("../api");
import Types = require("slownode");
export = remove;

function remove(task: Types.Event) {
	var self: EventLoop = this;

	return self.store("events")
		.delete()
		.where("id", "=", task.id);
}