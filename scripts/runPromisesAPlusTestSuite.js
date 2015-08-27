var promisesAplusTests = require("promises-aplus-tests");
var adapter = require('../src/promises/slowPromise');
promisesAplusTests(adapter, function (err) {/*...*/ });
