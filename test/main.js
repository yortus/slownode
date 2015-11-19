var slownode = require('..');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
// TODO: temp testing... make CTRL+C force node.js to exit immediately
// TODO: put this in its own file inside a before() function
process.on('SIGINT', function () {
    console.log('KILLED BY SIGINT (CTRL+C)');
    process.exit();
});
describe('Within an Epoch instance', function () {
    it('the setTimeout(...) API function works', function (done) {
        slownode.run("((" + main.toString() + ")())", 'tests-II');
        slownode.on('end', function () {
            console.log('Finished!');
            done();
        });
        function main() {
            loopNTimes(5);
            function loopNTimes(count) {
                console.log('tick');
                --count;
                if (count > 0) {
                    setTimeout(loopNTimes, 500, count);
                }
            }
        }
    });
    //it('the Promise class works', (done) => {
    //    slownode.run('tests', loopNTimes, 5);
    //    slownode.on('end', () => {
    //        console.log('Finished!');
    //        done();
    //    });
    //    // Function to process a single iteration
    //    function loopNTimes(count: number) {
    //        console.log('tick');
    //        --count;
    //        if (count > 0) {
    //            Promise.delay(500, {count, loopNTimes}).then(ctx => {
    //                //console.log('COUNT: ' + ctx.count);
    //                //console.log('EPOCH: ' + EPOCH);
    //                ctx.loopNTimes(ctx.count);
    //            });
    //        }
    //    }
    //});
    //it('the closure(...) API function works', (done) => {
    //    // Create an epoch
    //    var slow = slownode.open('slowtest.txt', 'ax');
    //    var bar: string;
    //    var foo = slow.closure({ bar: 'baz' }, (arg: string) => bar + arg);
    //    console.log(foo('555'));
    //    setTimeout(done, 300);
    //});
    //it('the async (...) API function works', (done) => {
    //    // Create an epoch
    //    var slow = slownode.open('slowtest.txt', 'ax');
    //    var fn = slow.async (() => {
    //        const slow = __const(require('epoch'));
    //        console.log(111);
    //        await (slow.Promise.delay(500));
    //        console.log(222);
    //        await (slow.Promise.delay(500));
    //        console.log(333);
    //        await (slow.Promise.delay(500));
    //        return 'finished';
    //    });
    //    fn()
    //    .then(result => {
    //        console.log(result);
    //        done();
    //    })
    //    .catch(done);
    //});
});
//declare function require(moduleId: string): any;
//declare function require(moduleId: 'epoch'): slownode.Epoch;
//# sourceMappingURL=main.js.map