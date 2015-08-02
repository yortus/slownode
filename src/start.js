var Promise = require("bluebird");
var Knex = require("knex");
var fs = require("fs");
var api = require("./index");
var validateConfig = require("./validateConfig");
var errors = require("./errors");
var createSchema = require("./store/create");
var readFile = Promise.promisify(fs.readFile);
function start(config) {
    validateConfig(config);
    api.configuration = config;
    api.connection = Knex({
        client: "sqlite3",
        connection: {
            filename: "slownode.db"
        }
    });
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