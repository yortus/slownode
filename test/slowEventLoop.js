var slow = require('slownode');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
describe('The slow event loop', function () {
    //// Set timeout to 10mins for interactive debugging of tests.
    //this.timeout(600000);
    it('implements setTimeout calls correctly', function (done) {
        // TODO: hacky hacky... satisfy dehydrator (but NOT rehydrator!)
        // TODO: Better to use some option where dehydration rules are relaxed (so closures allowed in then() calls)
        global['done'] = function (err) {
            delete global['done'];
            done(err);
        };
        slow.setTimeout(function () { return done(); }, 100);
    });
    it('implements clearTimeout calls correctly', function (done) {
        // TODO: hacky hacky... satisfy dehydrator (but NOT rehydrator!)
        // TODO: Better to use some option where dehydration rules are relaxed (so closures allowed in then() calls)
        global['done'] = function (err) {
            delete global['done'];
            done(err);
        };
        var timer = slow.setTimeout(function () { return done(new Error('Should never happen')); }, 100);
        slow.clearTimeout(timer);
        setTimeout(done, 300);
    });
    it('implements setImmediate calls correctly', function (done) {
        // TODO: hacky hacky... satisfy dehydrator (but NOT rehydrator!)
        // TODO: Better to use some option where dehydration rules are relaxed (so closures allowed in then() calls)
        global['done'] = function (err) {
            delete global['done'];
            done(err);
        };
        slow.setImmediate(function () { return done(); });
    });
    it('implements clearImmediate calls correctly', function (done) {
        // TODO: hacky hacky... satisfy dehydrator (but NOT rehydrator!)
        // TODO: Better to use some option where dehydration rules are relaxed (so closures allowed in then() calls)
        global['done'] = function (err) {
            delete global['done'];
            done(err);
        };
        var timer = slow.setImmediate(function () { return done(new Error('Should never happen')); });
        slow.clearImmediate(timer);
        setTimeout(done, 300);
    });
});
//# sourceMappingURL=slowEventLoop.js.map