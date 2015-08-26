//import async = require('asyncawait/async');
//import await = require('asyncawait/await');
//import Promise = require("bluebird");
//import slow = require('slownode');
//import chai = require("chai");
//chai.use(require('chai-as-promised'));
//var expect = chai.expect;


//// NB: For full Promise A+ testing use:
//// npm run test-promises-aplus


//describe('SlowPromise', function () {

//    //// Set timeout to 10mins for interactive debugging of tests.
//    //this.timeout(600000);

//    it('works 2', (done) => {
//        var p = new slow.Promise((resolve, reject) => {
//            setTimeout(() => resolve('foo'), 500);        
//        });

//        console.log('AAA');
//        p.then(value => {
//            console.log(value);
//            throw new Error('BAR');
//        })
//        .catch(error => {
//            console.log(error);
//            done();
//        });
//        console.log('BBB');

//    });
//});
