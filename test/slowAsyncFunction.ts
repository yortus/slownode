import slow = require('../src'); // TODO: fix this!!
import chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;


// TODO: temp testing... make CTRL+C force node.js to exit immediately
// TODO: put this in its own file inside a before() function
process.on('SIGINT', () => {
    console.log('KILLED BY SIGINT (CTRL+C)');
    process.exit();
});


describe('The async(...) function', function () {

    it('works', (done) => {

        var fn = slow.async((delay: number, count: number, cb) => {
            const SlowPromise: typeof slow.Promise = __const(require('slownode').SlowPromise);
            for (var i = 0; i < count; ++i) {
                console.log(`waiting...${i}`);
                cb();
                await (SlowPromise.delay(delay));
                //if (i > 4) throw new Error('herp derp');
            }
            return 'done';
        });

        function test() {
            //console.log('---');
        }

        slow.makeWeakRef(done);

        fn(300, 30, test)
        .then(slow.Closure({done}, result => {
            console.log(result);
            if (done) done();
        }))
        .catch(slow.Closure({done}, error => {
            console.log('ERROR: ' + error.message);
            if (done) done(error);
        }));
    });
});
