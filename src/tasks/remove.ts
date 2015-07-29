import Types = require("event-loop");
export = remove;

var remove = (task: Types.EventTask) => {
	var self: Types.EventLoop = this;

	return self.store("tasks")
		.delete()
		.where("id", "=", task.id);
}