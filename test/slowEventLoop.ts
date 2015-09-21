import slow = require('slownode');
import chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;


describe('The slow event loop', function () {

    it('implements setTimeout calls correctly', (done) => {
        slow.makeWeakRef(done);
        slow.setTimeout(() => done(), 100);
    });

    it('implements clearTimeout calls correctly', (done) => {
        slow.makeWeakRef(done);
        var timer = slow.setTimeout(() => done(new Error('Should never happen')), 100);
        slow.clearTimeout(timer);
        setTimeout(done, 300);
    });

    it('implements setImmediate calls correctly', (done) => {
        slow.makeWeakRef(done);
        slow.setImmediate(() => done());
    });

    it('implements clearImmediate calls correctly', (done) => {
        slow.makeWeakRef(done);
        var timer = slow.setImmediate(() => done(new Error('Should never happen')));
        slow.clearImmediate(timer);
        setTimeout(done, 300);
    });
});
