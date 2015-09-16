//import {async, await} from 'asyncawait';
//import slow = require('slownode');
//import chai = require("chai");
//chai.use(require('chai-as-promised'));
//var expect = chai.expect;


//describe('The slow event loop', function () {

//    it('implements setTimeout calls correctly', (done) => {

//        // TODO: hacky hacky... satisfy dehydrator (but NOT rehydrator!)
//        // TODO: Better to use some option where dehydration rules are relaxed (so closures allowed in then() calls)
//        global['done'] = err => {
//            delete global['done'];
//            done(err);
//        };

//        slow.setTimeout(() => done(), 100);

//    });

//    it('implements clearTimeout calls correctly', (done) => {

//        // TODO: hacky hacky... satisfy dehydrator (but NOT rehydrator!)
//        // TODO: Better to use some option where dehydration rules are relaxed (so closures allowed in then() calls)
//        global['done'] = err => {
//            delete global['done'];
//            done(err);
//        };

//        var timer = slow.setTimeout(() => done(new Error('Should never happen')), 100);
//        slow.clearTimeout(timer);
//        setTimeout(done, 300);
//    });

//    it('implements setImmediate calls correctly', (done) => {

//        // TODO: hacky hacky... satisfy dehydrator (but NOT rehydrator!)
//        // TODO: Better to use some option where dehydration rules are relaxed (so closures allowed in then() calls)
//        global['done'] = err => {
//            delete global['done'];
//            done(err);
//        };

//        slow.setImmediate(() => done());

//    });

//    it('implements clearImmediate calls correctly', (done) => {

//        // TODO: hacky hacky... satisfy dehydrator (but NOT rehydrator!)
//        // TODO: Better to use some option where dehydration rules are relaxed (so closures allowed in then() calls)
//        global['done'] = err => {
//            delete global['done'];
//            done(err);
//        };

//        var timer = slow.setImmediate(() => done(new Error('Should never happen')));
//        slow.clearImmediate(timer);
//        setTimeout(done, 300);
//    });
//});
