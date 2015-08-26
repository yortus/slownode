var slow = require('slownode');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
// NB: For full Promise A+ testing use:
// npm run test-promises-aplus
describe('SlowPromise', function () {
    //// Set timeout to 10mins for interactive debugging of tests.
    //this.timeout(600000);
    it('works 2', function (done) {
        var p = new slow.Promise(function (resolve, reject) {
            setTimeout(function () { return resolve('foo'); }, 500);
        });
        console.log('AAA');
        p.then(function (value) {
            console.log(value);
            throw new Error('BAR');
        })
            .catch(function (error) {
            console.log(error);
            done();
        });
        console.log('BBB');
    });
});
//# sourceMappingURL=slowPromise.js.map