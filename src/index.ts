import SlowNode = require("slownode");
import EventLoop = require("./eventloop/api");

var api: SlowNode.SlowNodeStatic = {
	EventLoop: EventLoop,
	EventEmitter: null
}
