import EventLoop = require("../index");
import Types = require("event-loop");
export = remove;

function remove(task: Types.Event) {
	var self: EventLoop = this;

	return self.store("events")
		.delete()
		.where("id", "=", task.id);
}