import EventLoop = require("../index");
import Types = require("event-loop");
import toTask = require("../toTask");
export = getNext;

var getNext = () => {
	var self: EventLoop = this;

	return self.store("events")
		.select()
		.where("runAt", "<=", Date.now())
		.orderBy("runAt", "asc")
		.orderBy("id", "asc")
		.limit(1)
		.then((rows: Types.EventSchema[]) => rows.length > 0 ? toTask(rows[0]) : null);
};