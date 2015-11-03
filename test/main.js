var Epoch = require('../src/epoch');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
describe('Within an Epoch instance', function () {
    it('setTimeout works', function (done) {
        // Create an epoch
        var slow = new Epoch();
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
    it('Promise works', function (done) {
        // Create an epoch
        var slow = new Epoch();
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
    it('closure works', function (done) {
        // Create an epoch
        var slow = new Epoch();
        var bar;
        var foo = slow.closure({ bar: 'baz' }, function (arg) { return bar + arg; });
        console.log(foo('555'));
        setTimeout(done, 300);
    });
});
//# sourceMappingURL=main.js.map