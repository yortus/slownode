import Types = require("slownode");
import store = require("../store/index");

export function create(callback: (resolve: SlowResolve, reject: SlowReject) => any) {
	
}



interface SlowResolve {
	(): void;
	(value: any): any; 
}

interface SlowReject {
	(): void;
	(reason: any): any;
}