import Types = require("event-loop");
import toTask = require("../toTask");
export = getNext;

var getNext = () => {
	var self: Types.EventLoop = this;

	return self.store("tasks")
		.select()
		.where("runAt", "<=", Date.now())
		.orderBy("runAt", "asc")
		.orderBy("id", "asc")
		.limit(1)
		.then((rows: Types.TaskSchema[]) => rows.length > 0 ? toTask(rows[0]) : null);
};