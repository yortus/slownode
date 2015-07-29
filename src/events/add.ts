import Types = require("event-loop");
import EventLoop = require("../index");
import store = require("./store");
export = add;

function add(event: Types.Event) {
	var self: EventLoop = this;

	return store(self.store, event)
}