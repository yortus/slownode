var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require("bluebird");
var slow = require('slownode');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
describe('SlowPromise', function () {
    // TODO: temp testing... 10mins
    this.timeout(600000);
    it('works', async.cps(function () {
        var r1 = slow.Promise.deferred();
        var p1 = r1.promise;
        // Should output:
        // 111
        // RESOLVED: 53
        // 222
        // 333
        // REJECTED: EEE!
        p1
            .then(function (value) {
            console.log('111');
            return Promise.delay(500).then(function () {
                console.log('@@@');
                return value;
            });
        })
            .then(function (value) {
            console.log('RESOLVED: ' + value);
        })
            .then(function (value) {
            console.log('222');
            return Promise.delay(500).then(function (value) { return value; });
        })
            .then(function (value) {
            console.log('333');
            throw new Error('EEE!');
        })
            .then(function (value) {
            console.log('444');
            return Promise.delay(500).then(function (value) { return value; });
        })
            .catch(function (error) {
            console.log('REJECTED: ' + error);
        });
        console.log('AAA');
        await(Promise.delay(500));
        console.log('BBB');
        r1.resolve(53);
        console.log('CCC');
        await(Promise.delay(500));
        console.log('DDD');
    }));
});
//# sourceMappingURL=slowPromise.js.map