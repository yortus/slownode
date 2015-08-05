import Promise = require("bluebird");
import fs = require("fs");
import SlowNode = require("./index");


SlowNode.stop()
	.then(() => SlowNode.start({ pollIntervalMs: 100 }));
	
