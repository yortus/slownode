import immediate = require("./function/setImmediate");
import timeout = require("./function/setTimeout");
import interval = require("./function/setInterval");

var api = {
	setTimeout: timeout,
	setImmediate: immediate,
	setInterval: interval,
	EventEmitter: null,
	Promise: null,
	
}
