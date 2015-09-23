var slow = require('..');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
describe('The slow event loop', function () {
    it('implements setTimeout calls correctly', function (done) {
        slow.makeWeakRef(done);
        slow.setTimeout(function () { return done(); }, 100);
    });
    it('implements clearTimeout calls correctly', function (done) {
        slow.makeWeakRef(done);
        var timer = slow.setTimeout(function () { return done(new Error('Should never happen')); }, 100);
        slow.clearTimeout(timer);
        setTimeout(done, 300);
    });
    it('implements setImmediate calls correctly', function (done) {
        slow.makeWeakRef(done);
        slow.setImmediate(function () { return done(); });
    });
    it('implements clearImmediate calls correctly', function (done) {
        slow.makeWeakRef(done);
        var timer = slow.setImmediate(function () { return done(new Error('Should never happen')); });
        slow.clearImmediate(timer);
        setTimeout(done, 300);
    });
});
//# sourceMappingURL=slowEventLoop.js.map