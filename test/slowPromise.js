var slow = require('..');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
// NB: For full Promise A+ testing use: npm run test-promises-aplus
describe('SlowPromise', function () {
    it('works', function (done) {
        slow.makeWeakRef(done);
        var p = slow.Promise.delay(500);
        console.log('AAA');
        p.then(function (value) {
            console.log(value);
            throw new Error('BAR');
        })
            .catch(slow.Closure({ done: done }, function (error) {
            console.log(error);
            if (done)
                done();
        }));
        console.log('BBB');
    });
});
//# sourceMappingURL=slowPromise.js.map