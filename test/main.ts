import slownode = require('..');
import chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;


describe('Within an Epoch instance', function () {

    it('the setTimeout(...) API function works', (done) => {

        // Create an epoch
        var slow = slownode.open('slowtest.txt', 'a+');
        slow.addWeakRef(slow);
        slow.addWeakRef(done);
        
        // Iterate until done
        loopNTimes(slow, done, 5);

        // Function to process a single iteration
        function loopNTimes(slow, done, countDown) {
            console.log('tick');
            --countDown;
            if (!countDown) return done();
            slow.setTimeout(loopNTimes, 500, slow, done, countDown);
        }
    });


    //it('the Promise class works', (done) => {

    //    // Create an epoch
    //    var slow = slownode.open('slowtest.txt', 'ax');
        
    //    // Iterate until done
    //    var countDown = 5;
    //    loop();

    //    // Function to process a single iteration
    //    function loop() {
    //        console.log('tick');
    //        --countDown;
    //        if (!countDown) return done();
    //        slow.Promise.delay(500).then(loop);
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


// TODO: these were in original typings. Where to put them now?
// The await and __const pseudo-keywords are global.
declare var await: <T>(arg: Promise<T>) => T;
declare var __const: <T>(init: T) => T;

//declare function require(moduleId: string): any;
//declare function require(moduleId: 'epoch'): slownode.Epoch;
