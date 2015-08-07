import SlowNode = require("../index");
import Types = require("slownode");
export = cps;

function cps(funcId: string, ...args: any[]) {
	var length = args.length; 
	if (length < 2) throw new Error("more args needed");
	
}