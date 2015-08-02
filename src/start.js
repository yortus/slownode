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
    count = 3;
    return prepareDatabase();
}
var count = 0;
function prepareDatabase() {
    if (count <= 0)
        throw new Error(errors.DatabaseInitFailed);
    count--;
    return Promise
        .delay(150)
        .then(function () { return readFile("slownode.db"); })
        .catch(createBlankDatabase)
        .then(createSchema)
        .then(function () { return true; })
        .catch(function (err) {
        console.log(err);
        return prepareDatabase();
    });
}
function createBlankDatabase(fileContent) {
    if (!!fileContent)
        return Promise.resolve(true);
    console.log("Create it!");
    return new Promise(function (resolve, reject) {
        fs.writeFile("slownode.db", "", function (err) {
            if (!err)
                return resolve(true);
            reject(err);
        });
    });
}
module.exports = start;
//# sourceMappingURL=start.js.map