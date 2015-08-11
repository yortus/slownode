import Types = require("slownode");
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import slow = require("./index");
import EventLoop = require("./eventLoop/index");
import connect = require("./store/connect");
import validateConfig = require("./validateConfig");
export = start;


var start = async((config: Types.ISlowConfig) => {
	validateConfig(config);
	slow.configuration = config;
	slow.connection = await(connect());
    EventLoop.flush();
});
