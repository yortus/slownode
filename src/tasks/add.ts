import Types = require("event-loop");
import store = require("./store");
export = add;

var add = (task: Types.EventTask) => {
	var self: Types.EventLoop = this;
	
	return store(self.store, [task])
}