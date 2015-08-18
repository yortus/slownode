import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Promise = require("bluebird");
import chai = require("chai");
import slow = require('slownode');
chai.use(require('chai-as-promised'));
var expect = chai.expect;


describe('epoch', () => {

    it('starts when the slownode module is required', async.cps(() => {

        // TODO: ...
        slow.SlowRoutineFunction;
    }));
});


describe('SlowRoutineFunction', () => {

    var mockRunner = (fn, args) => {
        var result = [];
        var __yield = value => result.push(value);
        var __const = value => value;
        var fn = eval('(' + fn.toString() + ')');
        try {
            result.push(fn.apply(null, args));
        }
        catch (ex) {
            result.push(ex);
        }
        return result;
    };


    var realRunner = (fn, args) => {
        var result = [];
        var slowfunc = new slow.SlowRoutineFunction(fn, { yieldIdentifier: '__yield', constIdentifier: '__const' });
        var sloro: slow.SlowRoutine = slowfunc.apply(null, args);
        while (true) {
            try {
                var yielded = sloro.next();
                result.push(yielded.value);
                if (yielded.done) return result;
            }
            catch (ex) {
                result.push(ex);
                return result;
            }
        }
    };


    it('returns a SlowRoutine that yields the expected results', async.cps(() => {
        var originals = [
            { func: require('./fixtures/slowfuncs/1'), args: [1, 10], result: ['stop', 11, 'done'] },
            { func: require('./fixtures/slowfuncs/2'), args: [10, 5], result: ['foo10', 'foo20', 'foo30', 'foo40', 'foo50', 'bar'] },
            { func: require('./fixtures/slowfuncs/3'), args: [], result: [0, 1, 2, 3, 4, 5, void 0] }
        ];

        for (var original of originals) {
            var originalResult = mockRunner(original.func, original.args);
            expect(originalResult).to.deep.equal(original.result);

            var modifiedResult = realRunner(original.func, original.args);
            expect(modifiedResult).to.deep.equal(original.result);
        }
    }));
});
