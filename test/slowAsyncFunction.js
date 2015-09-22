var slow = require('../src'); // TODO: fix this!!
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
    it('works', function (done) {
        var fn = slow.async(function (delay, count, cb) {
            var SlowPromise = __const(require('slownode').SlowPromise);
            for (var i = 0; i < count; ++i) {
                console.log("waiting..." + i);
                cb();
                await(SlowPromise.delay(delay));
            }
            return 'done';
        });
        function test() {
            //console.log('---');
        }
        slow.makeWeakRef(done);
        fn(300, 30, test)
            .then(slow.Closure({ done: done }, function (result) {
            console.log(result);
            if (done)
                done();
        }))
            .catch(slow.Closure({ done: done }, function (error) {
            console.log('ERROR: ' + error.message);
            if (done)
                done(error);
        }));
    });
});
//# sourceMappingURL=slowAsyncFunction.js.map