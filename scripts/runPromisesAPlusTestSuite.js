var promisesAplusTests = require("promises-aplus-tests");
var SlowPromise = require('../src/promises/slowPromise');


var dummyLog = {
    created: function() {},
    updated: function() {},
    deleted: function() {}
};


promisesAplusTests(SlowPromise.forEpoch(dummyLog), function (err) {/*...*/ });
