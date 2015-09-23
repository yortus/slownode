import slow = require('..');
import chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;


// NB: For full Promise A+ testing use: npm run test-promises-aplus


describe('SlowPromise', function () {

    it('works', (done) => {

        slow.makeWeakRef(done);

        var p = slow.Promise.delay(500);

        console.log('AAA');
        p.then(value => {
            console.log(value);
            throw new Error('BAR');
        })
        .catch(slow.Closure({done}, error => {
            console.log(error);
            if (done) done();
        }));
        console.log('BBB');
    });
});
