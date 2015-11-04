//import slownode = require('..');
//import chai = require("chai");
//chai.use(require('chai-as-promised'));
//var expect = chai.expect;


//// TODO: these were in original typings. Where to put them now?
//// The await and __const pseudo-keywords are global.
//declare var await: <T>(arg: Promise<T>) => T;
//declare var __const: <T>(init: T) => T;


//// TODO: temp testing... make CTRL+C force node.js to exit immediately
//// TODO: put this in its own file inside a before() function
//process.on('SIGINT', () => {
//    console.log('KILLED BY SIGINT (CTRL+C)');
//    process.exit();
//});


//describe('The async(...) function', function () {


//    var slow = slownode.open('slowtest.txt', 'ax');


//    it('works', (done) => {

//        var fn = slow.async((delay: number, count: number, cb) => {
//            const SlowPromise: typeof slow.Promise = __const(require('epoch').Promise); // TODO: flaky!! not relocatable...
//            for (var i = 0; i < count; ++i) {
//                console.log(`waiting...${i}`);
//                cb();
//                await(SlowPromise.delay(delay));
//                //if (i > 4) throw new Error('herp derp');
//            }
//            return 'done';
//        });

//        function test() {
//            //console.log('---');
//        }

//        slow.addWeakRef(done);

//        fn(30, 5, test)
//        .then(slow.closure({done}, result => {
//            console.log(result);
//            if (done) done();
//        }))
//        .catch(slow.closure({done}, error => {
//            console.log('ERROR: ' + error.message);
//            if (done) done(error);
//        }));
//    });
//});
