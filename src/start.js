var Promise = require("bluebird");
var fs = require("fs");
var validateConfig = require("./validateConfig");
var errors = require("./errors");
var createSchema = require("./store/create");
var readFile = Promise.promisify(fs.readFile);
function start(config) {
    var self = this;
    // TODO: More?
    validateConfig(config);
    self.configuration = config;
    return prepareDatabase();
}
var count = 3;
function prepareDatabase() {
    if (count === 0)
        throw new Error(errors.DatabaseInitFailed);
    count--;
    return Promise
        .delay(100)
        .then(function () { return readFile("slownode.db"); })
        .then(createSchema)
        .then(function () { return true; })
        .catch(prepareDatabase);
}
module.exports = start;
//# sourceMappingURL=start.js.map