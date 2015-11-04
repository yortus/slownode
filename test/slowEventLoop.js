var Epoch = require('..'); // TODO: get strong typing working!!
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
describe('The slow event loop', function () {
    var slow = new Epoch();
    it('implements setTimeout calls correctly', function (done) {
        slow.addWeakRef(done);
        slow.setTimeout(function () { return done(); }, 100);
    });
    it('implements clearTimeout calls correctly', function (done) {
        slow.addWeakRef(done);
        var timer = slow.setTimeout(function () { return done(new Error('Should never happen')); }, 100);
        slow.clearTimeout(timer);
        setTimeout(done, 300);
    });
});
//# sourceMappingURL=slowEventLoop.js.map