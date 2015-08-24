var fs = require('fs');
var path = require('path');
var databaseLocation = require('./databaseLocation');
var SlowRoutineFunction = require('./slowRoutine/slowRoutineFunction');
var asyncPseudoKeyword = require('./slowAsyncFunction/asyncPseudoKeyword');
var rehydrate = require('./slowAsyncFunction/rehydrate');
// TODO: set up a global handler (using bluebird API or node API?) to catch unhandled async
//       errors that arise from withing this module (make a SlowError type?).
//       eg, SlowPromise constructor is synchronous, but internally it must access DB so it
//       may throw an async error which the caller has no way of catching.
// ======================================================================================
// =                                                                                    =
// =  NB: Module initialization must be synchronous, so we use only sync methods here.  =
// =                                                                                    =
// ======================================================================================
// Check if the database already exists. Use fs.stat since fs.exists is deprecated.
var dbExists = true;
try {
    fs.statSync(databaseLocation);
}
catch (ex) {
    dbExists = false;
}
// Resume the current epoch (if DB exists) or start a new epoch (if no DB).
if (!dbExists) {
    var templateLocation = path.join(__dirname, '../empty.db');
    fs.writeFileSync(databaseLocation, fs.readFileSync(templateLocation));
}
// Connect to the database
var db = require('./knexConnection');
// TODO: temp testing... rehydrate any running async functions...
// TODO: we can't wait for completion here, just get it started... implications? Eg sqlite serialisation needed?
rehydrate();
// TODO: temp testing... Build the API for export...
var api = {};
api.SlowRoutineFunction = SlowRoutineFunction;
api.async = asyncPseudoKeyword;
module.exports = api;
//# sourceMappingURL=index.js.map