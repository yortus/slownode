var slow = require('slownode');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
// NB: For full Promise A+ testing use: npm run test-promises-aplus
describe('SlowPromise', function () {
    // Set timeout to 10mins for interactive debugging of tests.
    this.timeout(600000);
    it('works 2', function (done) {
        // TODO: hacky hacky... satisfy dehydrator (but NOT rehydrator!)
        // TODO: Better to use some option where dehydration rules are relaxed (so closures allowed in then() calls)
        global['done'] = function (err) {
            delete global['done'];
            done(err);
        };
        //var p = new slow.Promise((resolve, reject) => {
        //    setTimeout(() => resolve('foo'), 500);        
        //});
        var p = slow.Promise.delay(500);
        console.log('AAA');
        p.then(function (value) {
            console.log(value);
            throw new Error('BAR');
        })
            .catch(function (error) {
            console.log(error);
            done(); // TODO: isRelocatableFunction sees this as global.done due to above hack and says its ok
        });
        console.log('BBB');
    });
});
//# sourceMappingURL=slowPromise.js.map