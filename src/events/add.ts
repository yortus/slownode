import Types = require("event-loop");
import store = require("./store");
export = add;

var add = (task: Types.Event) => {
	var self: Types.EventLoop = this;
	
	// var isGenericTask = task.functionId == null;
	// if (isGenericTask) {
	// 	var handlers = 
	// }
	
	return store(self.store, [task])
}