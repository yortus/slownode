import SlowNode = require("../index");
export = stop;

function stop() {

	if (SlowNode.flushCallback) clearTimeout(SlowNode.flushCallback);
};