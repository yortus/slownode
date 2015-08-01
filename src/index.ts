import Types = require("slownode");
import immediate = require("./function/setImmediate");
import timeout = require("./function/setTimeout");
import interval = require("./function/setInterval");

import start = require("./start");
import exit = require("./exit");
export = SlowNode;

var SlowNode: Types.SlowNodeStatic = {
	configuration: null,
	
	start: start,
	exit: exit,
	 
	setTimeout: timeout,
	setImmediate: immediate,
	setInterval: interval,
	
	EventEmitter: null,
	EventLoop: null,
	Promise: null,
}