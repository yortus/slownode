import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Promise = require("bluebird");
import slow = require('slownode');
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


    // Set timeout to 10mins for interactive debugging of tests.
    this.timeout(600000);


    it('works', async.cps(() => {

        var fn = slow.async((delay: number, count: number) => {
            const SlowPromise: typeof slow.Promise = __const(require('slownode').SlowPromise);
            for (var i = 0; i < count; ++i) {
                console.log(`waiting...${i}`);
                await (SlowPromise.delay(delay));
                //if (i > 4) throw new Error('herp derp');
            }
            return 'done';
        });

        try {
            var result = await(fn(500, 10));
            console.log(result);
        }
        catch (ex) {
            console.log('ERROR: ' + ex.message);
        }
    }));
});
