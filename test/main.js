var async = require('asyncawait/async');
var await = require('asyncawait/await');
var slow = require('slownode');
var chai = require("chai");
var databaseLocation = require("../src/databaseLocation");
var fs = require("fs");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
describe('epoch', function () {
    it('starts when the slownode module is required', async.cps(function () {
        // TODO: ...
        slow.SlowRoutineFunction;
        expect(fs.statSync(databaseLocation)).to.exist;
    }));
});
describe('SlowRoutineFunction', function () {
    var mockRunner = function (fn, args) {
        var result = [];
        var __yield = function (value) { return result.push(value); };
        var __const = function (value) { return value; };
        var fn = eval('(' + fn.toString() + ')');
        try {
            result.push(fn.apply(null, args));
        }
        catch (ex) {
            result.push(ex);
        }
        return result;
    };
    var realRunner = function (fn, args) {
        var result = [];
        var slowfunc = slow.SlowRoutineFunction(fn, { yieldIdentifier: '__yield', constIdentifier: '__const' });
        var sloro = slowfunc.apply(null, args);
        while (true) {
            try {
                var yielded = sloro.next();
                result.push(yielded.value);
                if (yielded.done)
                    return result;
            }
            catch (ex) {
                result.push(ex);
                return result;
            }
        }
    };
    it('returns a SlowRoutine that yields the expected results', async.cps(function () {
        var originals = [
            { func: require('./fixtures/slowfuncs/1'), args: [1, 10], result: ['stop', 11, 'done'] },
            { func: require('./fixtures/slowfuncs/2'), args: [10, 5], result: ['foo10', 'foo20', 'foo30', 'foo40', 'foo50', 'bar'] },
            { func: require('./fixtures/slowfuncs/3'), args: [], result: [0, 1, 2, 3, 4, 5, void 0] }
        ];
        for (var _i = 0; _i < originals.length; _i++) {
            var original = originals[_i];
            var originalResult = mockRunner(original.func, original.args);
            expect(originalResult).to.deep.equal(original.result);
            var modifiedResult = realRunner(original.func, original.args);
            expect(modifiedResult).to.deep.equal(original.result);
        }
    }));
});
describe('The async(...) function', function () {
    // TODO: temp testing... 10mins
    this.timeout(600000);
    // TODO: temp testing... make CTRL+C force node.js to exit immediately
    process.on('SIGINT', function () {
        console.log('KILLED BY SIGINT (CTRL+C)');
        process.exit();
    });
    var fn = slow.async(function (delay, count) {
        var Promise = __const(require('bluebird'));
        for (var i = 0; i < count; ++i) {
            console.log("waiting..." + i);
            await(Promise.delay(delay));
        }
        return 'done';
    });
    it('works', async.cps(function () {
        try {
            var result = await(fn(500, 5));
            console.log(result);
        }
        catch (ex) {
            console.log('ERROR: ' + ex.message);
        }
    }));
});
//# sourceMappingURL=main.js.map