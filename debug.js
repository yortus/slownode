

// run local test suite.
//require('./node_modules/mocha/bin/_mocha');


// Run Promises A+ official test suite.
var promisesAplusTests = require("promises-aplus-tests");
var adapter = require('./src/slowPromise');
promisesAplusTests(adapter, function (err) {/*...*/ });
