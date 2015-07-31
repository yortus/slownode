import SlowNode = require("slownode");
import Promise = require("bluebird");
import Knex = require("knex");
import fs = require("fs");
import db = require("./store/db");
import validateConfig = require("./validateConfig");
export = start;

function start(config: SlowNode.Config) {
	var self: SlowNode.SlowNodeStatic = this;
	// TODO: More?
	validateConfig(config);
	self.configuration = config;
}