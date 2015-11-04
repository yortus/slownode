var slownode = require('..'); // TODO: get strong typing working!!
import chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;


describe('The slow event loop', function () {

    var slow = slownode.open('');

    it('implements setTimeout calls correctly', (done) => {
        slow.addWeakRef(done);
        slow.setTimeout(() => done(), 100);
    });

    it('implements clearTimeout calls correctly', (done) => {
        slow.addWeakRef(done);
        var timer = slow.setTimeout(() => done(new Error('Should never happen')), 100);
        slow.clearTimeout(timer);
        setTimeout(done, 300);
    });
});
