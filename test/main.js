var async = require('asyncawait/async');
var chai = require("chai");
chai.use(require('chai-as-promised'));
var expect = chai.expect;
describe('epoch', function () {
    it('starts when the slownode module is required', async.cps(function () {
        var slow = require('slownode');
        slow.slowfunc;
    }));
});
describe('slowfunc', function () {
    it('works', async.cps(function () {
        var slow = require('slownode');
        var originals = [
            { func: require('./fixtures/slowfuncs/1'), args: [1, 10], result: ['stop', 11] }
        ];
        var modifieds = originals.map(function (orig) { return ({ func: slow.slowfunc(orig.func), args: orig.args, result: orig.result }); });
        for (var i = 0; i < originals.length; ++i) {
            var modifiedSource = modifieds[i].func.toString(); // NB: Used only for inspection during debugging
            var originalResult = originals[i].func.apply(null, originals[i].args);
            expect(originalResult).to.deep.equal(originals[i].result);
            var modifiedResult = modifieds[i].func.apply(null, modifieds[i].args);
            expect(modifiedResult).to.deep.equal(modifieds[i].result);
        }
    }));
});
//# sourceMappingURL=main.js.map