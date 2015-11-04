var slownode = require('..'); // TODO: get strong typing working!!
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
describe('Within an Epoch instance', function () {
    it('the setTimeout(...) API function works', function (done) {
        // Create an epoch
        var slow = slownode.open('');
        // Iterate until done
        var countDown = 5;
        loop();
        // Function to process a single iteration
        function loop() {
            console.log('tick');
            --countDown;
            if (!countDown)
                return done();
            slow.setTimeout(loop, 500);
        }
    });
    it('the Promise class works', function (done) {
        // Create an epoch
        var slow = slownode.open('');
        // Iterate until done
        var countDown = 5;
        loop();
        // Function to process a single iteration
        function loop() {
            console.log('tick');
            --countDown;
            if (!countDown)
                return done();
            slow.Promise.delay(500).then(loop);
        }
    });
    it('the closure(...) API function works', function (done) {
        // Create an epoch
        var slow = slownode.open('');
        var bar;
        var foo = slow.closure({ bar: 'baz' }, function (arg) { return bar + arg; });
        console.log(foo('555'));
        setTimeout(done, 300);
    });
    it('the async (...) API function works', function (done) {
        // Create an epoch
        var slow = slownode.open('');
        var fn = slow.async(function () {
            var slow = __const(require('epoch'));
            console.log(111);
            await(slow.Promise.delay(500));
            console.log(222);
            await(slow.Promise.delay(500));
            console.log(333);
            await(slow.Promise.delay(500));
            return 'finished';
        });
        fn(5)
            .then(function (result) {
            console.log(result);
            done();
        })
            .catch(done);
    });
});
//declare function require(moduleId: string): any;
//declare function require(moduleId: 'epoch'): slownode.Epoch;
//# sourceMappingURL=main.js.map