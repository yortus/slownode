var slow = require('../src');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
describe('it', function () {
    it('works', function (done) {
        var countDown = 4;
        loop();
        function loop() {
            console.log('tick');
            --countDown;
            if (!countDown)
                return done();
            slow.setTimeout(loop, 500);
        }
    });
});
//# sourceMappingURL=main.js.map