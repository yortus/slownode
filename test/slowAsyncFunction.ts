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


    it('works', (done) => {

        // TODO: hacky hacky... satisfy dehydrator (but NOT rehydrator!)
        // TODO: Better to use some option where dehydration rules are relaxed (so closures allowed in then() calls)
        global['done'] = err => {
            delete global['done'];
            done(err);
        };

        var fn = slow.async((delay: number, count: number) => {
            const SlowPromise: typeof slow.Promise = __const(require('slownode').SlowPromise);
            for (var i = 0; i < count; ++i) {
                console.log(`waiting...${i}`);
                await (SlowPromise.delay(delay));
                //if (i > 4) throw new Error('herp derp');
            }
            return 'done';
        });


        fn(200, 30)
        .then(result => {
            console.log(result);
            done(); // TODO: isRelocatableFunction sees this as global.done due to above hack and says its ok
        })
        .catch(error => {
            console.log('ERROR: ' + error.message);
            done(error); // TODO: isRelocatableFunction sees this as global.done due to above hack and says its ok
        });
    });
});
