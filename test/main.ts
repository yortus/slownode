import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Promise = require("bluebird");
import chai = require("chai");
import Types = require('slownode');
chai.use(require('chai-as-promised'));
var expect = chai.expect;


describe('epoch', () => {

    it('starts when the slownode module is required', async.cps(() => {
        var slow: typeof Types = require('slownode');
        slow.slowfunc;
    }));
});


describe('slowfunc', () => {

    it('works', async.cps(() => {
        var slow: typeof Types = require('slownode');
        var originals = [
            { func: require('./fixtures/slowfuncs/1'), args: [1, 10], result: ['stop', 11] }
        ];
        var modifieds = originals.map(orig => ({ func: slow.slowfunc(orig.func), args: orig.args, result: orig.result }));

        for (var i = 0; i < originals.length; ++i) {
            var modifiedSource = modifieds[i].func.toString(); // NB: Used only for inspection during debugging

            var originalResult = originals[i].func.apply(null, originals[i].args);
            expect(originalResult).to.deep.equal(originals[i].result);

            var modifiedResult = await(modifieds[i].func.apply(null, modifieds[i].args));
            expect(modifiedResult).to.deep.equal(modifieds[i].result);
        }
    }));
});
