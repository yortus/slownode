import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;
import toStorable = require("./toStorable");
import errors = require("../../errors");
export = addTimed;

function addTimed(slowFunction: Types.SlowFunction) {
	if (!slowFunction.options) throw new Error(errors.TimedFuncsMustHaveOptions);	

	var storableFn = toStorable(slowFunction);
	// TODO...
}