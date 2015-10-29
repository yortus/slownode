import slow = require('../src');
import chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;


describe('it', function () {

    it('works', (done) => {

        var countDown = 4;

        loop();

        function loop() {
            console.log('tick');
            --countDown;
            if (!countDown) return done();
            slow.setTimeout(loop, 500);
        }
    });
});
