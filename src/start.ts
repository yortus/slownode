import Types = require("slownode");
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import settings = require("./settings");
import EventLoop = require("./eventLoop/index");
import connect = require("./store/connect");
import validateConfig = require("./validateConfig");
export = start;


var start = async((config: Types.SlowConfig) => {
    validateConfig(config);
    settings.configuration = config;
    settings.connection = await(connect());
    EventLoop.flush();
});
