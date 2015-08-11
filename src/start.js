var async = require('asyncawait/async');
var await = require('asyncawait/await');
var slow = require("./index");
var EventLoop = require("./eventLoop/index");
var connect = require("./store/connect");
var validateConfig = require("./validateConfig");
var start = async(function (config) {
    validateConfig(config);
    slow.configuration = config;
    slow.connection = await(connect());
    EventLoop.flush();
});
module.exports = start;
//# sourceMappingURL=start.js.map