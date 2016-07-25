import {KVON} from 'slownode';
import {expect} from 'chai';





// TODO: how to check ES6 types like Maps for deep equality?
// let m1 = new Map([['a', 1], ['b', 2]]);
// let m2 = new Map([['a', 1], ['b', 2], ['c', 3]]);
// expect(m1).to.not.deep.equal(m2); // FAIL





describe('KVON.stringify correctly handles various arguments', () => {

    let tests = [
        [{a:1}, null, null, `{"a":1}`],
        [[1,,,4], null, null, `[1,4]`],
        [[,2,,5], KVON.replacers.Array, null, `{"$":"Array","props":{"1":2,"3":5}}`],
        [undefined, null, null, `ERROR: (KVON) no known serialization...`],
        [undefined, KVON.replacers.undefined, null, `{"$":"undefined"}`],
        [{foo: [void 0,,3]}, KVON.replacers.all, null, `{"foo":{"$":"Array","props":{"0":{"$":"undefined"},"2":3}}}`],

        [[NaN,-0], [KVON.replacers.NaN, KVON.replacers.Infinity], null, `[{"$":"NaN"},0]`],
        [[NaN,-0], [KVON.replacers.NaN, KVON.replacers.negativeZero], null, `[{"$":"NaN"},{"$":"-0"}]`],

        [{a:1, b:2}, [], null, `{}`],
        [{a:1, b:{a:11,b:22,c:33}}, ['a'], null, `{"a":1}`],
        [{a:1, b:{a:11,b:22,c:33}}, ['b'], null, `{"b":{"b":22}}`],
        [{a:1, b:{a:11,b:22,c:33}}, ['a', 'b'], null, `{"a":1, "b":{"a":11,"b":22}}`],
        [{a:1, b:{a:11,b:22,c:33}}, ['c', 'b'], null, `{"b":{"b":22,"c":33}}`],
        [{a:9, b:{a:11,b:22,c:33}}, ['a', 'c'], null, `{"a":9}`],

        [{1:2,3:4}, ["1"], null, `{"1":2}`],
        [{1:2,3:4}, [3], null, `{"3":4}`],
        [345, [], null, `345`],
        [345, ['1'], null, `345`],
        [null, [], null, `null`],
        [true, [], null, `true`],
        [[1,2,3], [], null, `[1,2,3]`],
        [[1,2,3], [2], null, `[1,2,3]`],

        [null, null, 2, `null`],
        [false, null, 2, `false`],
        [123, null, 2, `123`],
        ['foo', null, 2, `"foo"`],
        [[[]], null, 2, `[\n  []\n]`],
        [[1,2,3], null, 2, `[\n  1,\n  2,\n  3\n]`],
        [{x:4,y:7}, null, 2, `{\n  "x":4,\n  "y":7\n}`],
        [{x:[],y:[3,{foo:true}]}, null, 2, `{\n  "x":[],\n  "y":[\n    3,\n    {\n      "foo":true\n    }\n  ]\n}`],

        [[[1]], null, 0, `[[1]]`],
        [[[1]], null, 1, `[\n [\n  1\n ]\n]`],
        [[[1]], null, 4, `[\n    [\n        1\n    ]\n]`],
        [[[1]], null, 10, `[\n          [\n                    1\n          ]\n]`],
        [[[1]], null, 11, `[\n          [\n                    1\n          ]\n]`],
        [[[1]], null, 20, `[\n          [\n                    1\n          ]\n]`],
        [[[2]], null, '', `[[2]]`],
        [[[2]], null, '-', `[\n-[\n--2\n-]\n]`],
        [[[2]], null, '    ', `[\n    [\n        1\n    ]\n]`],
        [[[2]], null, '\t\b', `[\n\t\b[\n\t\b\t\b2\n\t\b]\n]`],
        [[[2]], null, '[x]', `[\n[x][\n[x][x]2\n[x]]\n]`],
        [[[2]], null, '0123456789', `[\n0123456789[\n012345678901234567892\n0123456789]\n]`],
        [[[2]], null, '0123456789abcdef', `[\n0123456789[\n012345678901234567892\n0123456789]\n]`],
    ];

    tests.forEach(test => {
        let [value, replacer, space, result] = <[{}, any, any, string]>test;
        it(JSON.stringify(result).slice(1, -1).replace(/\\\"/g, '"'), () => {
            // TODO: add try/catch?
            let expected = result;
            let actual: any;
            try {
                actual = KVON.stringify(value, replacer, space);
            }
            catch (ex) {
                actual = `ERROR: ${ex.message}`;
                if (typeof expected === 'string' && expected.endsWith('...')) {
                    actual = actual.slice(0, expected.length - 3) + '...';
                }
            }
            expect(actual).to.deep.equal(expected);
        });
    });
});
