import * as SlowNode from "../../index";
export = stop;

function stop() {

	if (SlowNode.flushCallback) clearTimeout(SlowNode.flushCallback);
};