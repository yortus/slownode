import Epoch = require('../src/epoch');
import chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;


describe('it', function () {

    it('works', (done) => {

        // Create an epoch
        var slow = new Epoch();
        
        // Iterate until done
        var countDown = 4;
        loop();

        // Function to process a single iteration
        function loop() {
            console.log('tick');
            --countDown;
            if (!countDown) return done();
            slow.setTimeout(loop, 500);
        }
    });
});
