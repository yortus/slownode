import Epoch = require('../src/epoch');
import chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;


describe('Within an Epoch instance', function () {

    it('setTimeout works', (done) => {

        // Create an epoch
        var slow = new Epoch();
        
        // Iterate until done
        var countDown = 5;
        loop();

        // Function to process a single iteration
        function loop() {
            console.log('tick');
            --countDown;
            if (!countDown) return done();
            slow.setTimeout(loop, 500);
        }
    });


    it('Promise works', (done) => {

        // Create an epoch
        var slow = new Epoch();
        
        // Iterate until done
        var countDown = 5;
        loop();

        // Function to process a single iteration
        function loop() {
            console.log('tick');
            --countDown;
            if (!countDown) return done();
            slow.Promise.delay(500).then(loop);
        }
    });


    it('closure works', (done) => {

        // Create an epoch
        var slow = new Epoch();

        var bar: string;
        var foo = slow.closure({ bar: 'baz' }, (arg: string) => bar + arg);
        console.log(foo('555'));
        setTimeout(done, 300);
    });

});
