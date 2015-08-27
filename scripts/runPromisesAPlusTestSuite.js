var promisesAplusTests = require("promises-aplus-tests");
var adapter = require('../src/slowPromise');
promisesAplusTests(adapter, function (err) {/*...*/ });
