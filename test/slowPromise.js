//import async = require('asyncawait/async');
//import await = require('asyncawait/await');
//import Promise = require("bluebird");
//import slow = require('slownode');
//import chai = require("chai");
//chai.use(require('chai-as-promised'));
//var expect = chai.expect;
//describe('SlowPromise', function () {
//    // TODO: temp testing... 10mins
//    this.timeout(0);
//    it('works', async.cps(() => {
//        var r1 = slow.Promise.deferred();
//        var p1 = r1.promise;
//        // Should output:
//        // 111
//        // RESOLVED: 53
//        // 222
//        // 333
//        // REJECTED: EEE!
//        p1
//        .then(value => {
//            console.log('111');
//            //return Promise.delay(500).then(() => {
//            //    console.log('@@@');
//            //    return value;
//            //});
//        })
//        .then(value => {
//            console.log('RESOLVED: ' + value);
//        })
//        .then(value => {
//            console.log('222');
//            return Promise.delay(500).then(value => value);
//        })
//        .then(value => {
//            console.log('333');
//            throw new Error('EEE!');
//        })
//        .then(value => {
//            console.log('444');
//            return Promise.delay(500).then(value => value);
//        })
//        .catch(error => {
//            console.log('REJECTED: ' + error);
//        });
//        console.log('AAA');
//        await(Promise.delay(500));
//        console.log('BBB');
//        r1.resolve(53);
//        console.log('CCC');
//        await(Promise.delay(500));
//        console.log('DDD');
//    }));
//});
//# sourceMappingURL=slowPromise.js.map