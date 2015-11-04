var slownode = require('..'); // TODO: get strong typing working!!
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
// NB: For full Promise A+ testing use: npm run test-promises-aplus
describe('SlowPromise', function () {
    it('works', function (done) {
        var slow = slownode.open('');
        slow.addWeakRef(done);
        var p = slow.Promise.delay(500);
        console.log('AAA');
        p.then(function (value) {
            console.log(value);
            throw new Error('BAR');
        })
            .catch(slow.closure({ done: done }, function (error) {
            console.log(error);
            if (done)
                done();
        }));
        console.log('BBB');
    });
});
//# sourceMappingURL=slowPromise.js.map