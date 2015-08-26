import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Promise = require("bluebird");
import slow = require('slownode');
import chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;


//describe('epoch', () => {

//    it('starts when the slownode module is required', async.cps(() => {
//        // TODO: ...
//        slow.SlowRoutineFunction;
//    }));
//});


//describe('SlowRoutineFunction', () => {

//    var mockRunner = (fn, args) => {
//        var result = [];
//        var __yield = value => result.push(value);
//        var __const = value => value;
//        var fn = eval('(' + fn.toString() + ')');
//        try {
//            result.push(fn.apply(null, args));
//        }
//        catch (ex) {
//            result.push(ex);
//        }
//        return result;
//    };


//    var realRunner = (fn, args) => {
//        var result = [];
//        var slowfunc = slow.SlowRoutineFunction(fn, { yieldIdentifier: '__yield', constIdentifier: '__const' });
//        var sloro: slow.SlowRoutine = slowfunc.apply(null, args);
//        while (true) {
//            try {
//                var yielded = sloro.next();
//                result.push(yielded.value);
//                if (yielded.done) return result;
//            }
//            catch (ex) {
//                result.push(ex);
//                return result;
//            }
//        }
//    };


//    it('returns a SlowRoutine that yields the expected results', async.cps(() => {
//        var originals = [
//            { func: require('./fixtures/slowfuncs/1'), args: [1, 10], result: ['stop', 11, 'done'] },
//            { func: require('./fixtures/slowfuncs/2'), args: [10, 5], result: ['foo10', 'foo20', 'foo30', 'foo40', 'foo50', 'bar'] },
//            { func: require('./fixtures/slowfuncs/3'), args: [], result: [0, 1, 2, 3, 4, 5, void 0] }
//        ];

//        for (var original of originals) {
//            var originalResult = mockRunner(original.func, original.args);
//            expect(originalResult).to.deep.equal(original.result);

//            var modifiedResult = realRunner(original.func, original.args);
//            expect(modifiedResult).to.deep.equal(original.result);
//        }
//    }));
//});


//describe('The async(...) function', function () {


//    // Set timeout to 10mins for interactive debugging of tests.
//    this.timeout(600000);


//    // TODO: temp testing... make CTRL+C force node.js to exit immediately
//    process.on('SIGINT', () => {
//        console.log('KILLED BY SIGINT (CTRL+C)');
//        process.exit();
//    });


//    it('works', async.cps(() => {

//        var fn = slow.async((delay: number, count: number) => {
//            const Promise = __const(require('bluebird'));
//            for (var i = 0; i < count; ++i) {
//                console.log(`waiting...${i}`);
//                await (Promise.delay(delay));
//                //if (i > 4) throw new Error('herp derp');
//            }
//            return 'done';
//        });

//        try {
//            var result = await(fn(500, 5));
//            console.log(result);
//        }
//        catch (ex) {
//            console.log('ERROR: ' + ex.message);
//        }
//    }));
//});
