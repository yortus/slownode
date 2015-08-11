var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require("bluebird");
var slow = require("slownode");
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
slow.DEBUG = true;
describe("EventLoop behaviour tests", function () {
    it("will remove the previous database before starting", async.cps(function () {
        await(slow.ready);
        await(slow.stop());
    }));
    it("will throw when provided a non-number polling delay", async.cps(function () {
        await(slow.ready);
        var config = { pollIntervalMs: "string" };
        expect(function () { return await(slow.start(config)); }).to.throw(slow.errors.MustBeNumber);
    }));
    it("will throw when provided <50 polling delay", async.cps(function () {
        await(slow.ready);
        var config = { pollIntervalMs: 49 };
        expect(function () { return await(slow.start(config)); }).to.throw(slow.errors.InvalidPollDelay);
    }));
    it("will throw when provided polling delay of infinity", async.cps(function () {
        await(slow.ready);
        var config = { pollIntervalMs: Infinity };
        expect(function () { return await(slow.start(config)); }).to.throw(slow.errors.NotInfinity);
    }));
    it("will create an instance of EventLoop and create the database", async.cps(function () {
        await(slow.ready);
        expect(await(slow.start({ pollIntervalMs: 50 }))).to.be.undefined;
    }));
    it("will have SlowNode implicitly available in a SlowFunction", async.cps(function () {
        await(slow.ready);
        await(slow.setImmediate(function () {
            this.chai.expect(slow).to.exist;
        }, dep()));
        await(Promise.delay(150));
    }));
    it("will create an immediate function call with injected reference", async.cps(function () {
        await(slow.ready);
        await(slow.setImmediate(function () {
            this.chai.expect(this.h.STATUS_CODES['200']).to.equal("OK");
        }, dep("h", "http")));
        await(Promise.delay(150));
    }));
    it("will create an immediate function call with injected value", async.cps(function () {
        await(slow.ready);
        await(slow.setImmediate(function () {
            this.chai.expect(this.injectedValue).to.equal("OK");
        }, dep("injectedValue", null, "OK")));
        await(Promise.delay(150));
    }));
    it("will create and call a function with a delay", async.cps(function () {
        var start = Date.now();
        await(slow.ready);
        await(slow.setTimeout(function () {
            var diff = Date.now() - this.start;
            this.chai.expect(diff).to.be.above(249);
            this.chai.expect(diff).to.be.below(500);
        }, 250, dep("start", null, start)));
        await(Promise.delay(150));
    }));
    it("will create an event listener then emit an event with an argument", async.cps(function () {
        var func = function (arg) {
            this.chai.expect(arg).to.equal("argument");
        };
        await(slow.ready);
        var res = await(slow.EventEmitter.once("test", func, dep()));
        expect(res).to.be.equal(true);
        await(slow.EventEmitter.emit("test", "argument"));
        await(Promise.delay(150));
    }));
    it("will create a named SlowFunction", async.cps(function () {
        await(slow.ready);
        var id = await(slow.SlowFunction("testFunction", function (args) {
            return args;
        }, dep()));
        expect(id).to.equal("testFunction");
    }));
    it("will callback a named function with arguments", async.cps(function () {
        await(slow.ready);
        var val = await(slow.Callback("testFunction", "test callback"));
        expect(val).to.be.equal("test callback");
    }));
    it("will created a named SlowFunction that takes 2 arguments", async.cps(function () {
        await(slow.ready);
        var id = await(slow.SlowFunction("secondFunction", function (left, right) {
            return left + right;
        }, dep()));
        expect(id).to.equal("secondFunction");
    }));
    it("will callback a named function with 2 arguments", async.cps(function () {
        await(slow.ready);
        var val = await(slow.Callback("secondFunction", 3, 7));
        expect(val).to.equal(10);
        await(Promise.delay(150));
    }));
});
function dep(as, reference, value) {
    var dep = {
        dependencies: [{ reference: "chai", as: "chai " }]
    };
    if (!as)
        return dep;
    if (reference == null)
        dep.dependencies.push({ as: as, value: value });
    else
        dep.dependencies.push({ as: as, reference: reference });
    return dep;
}
//# sourceMappingURL=main.js.map