import Types = require("slownode");
import EventLoop = require("../api");
import store = require("./store");
export = add;

function add(event: Types.Event) {
	var self: EventLoop = this;

	return store(self.store, event)
}