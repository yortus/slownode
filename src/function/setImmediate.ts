import functionStore = require("../store/function");
import Types = require("slownode");
import toStorable = require("./toStorable");
export = immediate;

function immediate(slowFunction: Types.SlowFunction) {
	// TODO: Rules/logic...
	
	return functionStore.add(slowFunction);
}