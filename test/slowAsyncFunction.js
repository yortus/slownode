var async = require('asyncawait/async');
var await = require('asyncawait/await');
var slow = require('slownode');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
// TODO: temp testing... make CTRL+C force node.js to exit immediately
// TODO: put this in its own file inside a before() function
process.on('SIGINT', function () {
    console.log('KILLED BY SIGINT (CTRL+C)');
    process.exit();
});
describe('The async(...) function', function () {
    // Set timeout to 10mins for interactive debugging of tests.
    this.timeout(600000);
    it('works', async.cps(function () {
        var fn = slow.async(function (delay, count) {
            var Promise = __const(require('bluebird'));
            for (var i = 0; i < count; ++i) {
                console.log("waiting..." + i);
                await(Promise.delay(delay));
            }
            return 'done';
        });
        try {
            var result = await(fn(500, 5));
            console.log(result);
        }
        catch (ex) {
            console.log('ERROR: ' + ex.message);
        }
    }));
});
//# sourceMappingURL=slowAsyncFunction.js.map