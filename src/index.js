var fs = require('fs');
var path = require('path');
var databaseLocation = require('./databaseLocation');
// Resume the current epoch (if DB exists) or start a new epoch (if no DB).
// NB: Module initialisation must be synchronous, so we use only sync methods here.
if (!fs.existsSync(databaseLocation)) {
    // Start a new epoch by copying from the empty template database (synchronously).
    var templateLocation = path.join(__dirname, '../empty.db');
    fs.writeFileSync(databaseLocation, fs.readFileSync(templateLocation));
}
// Connect to the database
var db = require('./knexConnection');
// TODO: temp testing... Build the API for export...
//export var slowfunc = require('./slowAsyncFunction/slowfunc');
exports.SlowRoutine = require('./slowRoutine/slowRoutine');
//# sourceMappingURL=index.js.map