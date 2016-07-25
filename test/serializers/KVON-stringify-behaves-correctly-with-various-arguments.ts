import {KVON} from 'slownode';
import {expect} from 'chai';





// TODO: how to check ES6 types like Maps for deep equality?
// let m1 = new Map([['a', 1], ['b', 2]]);
// let m2 = new Map([['a', 1], ['b', 2], ['c', 3]]);
// expect(m1).to.not.deep.equal(m2); // FAIL





describe('KVON.stringify behaves correctly with various arguments', () => {

    let tests = [
        [{a: 1}, null, null, `{"a":1}`],
        [[1,,,4], null, null, `[1,4]`],
        [[,2,,5], KVON.replacers.Array, null, `{"$":"Array","props":{"1":2,"3":5}}`],
        [undefined, null, null, `ERROR: (KVON) no known serialization...`],
        [undefined, KVON.replacers.undefined, null, `{"$":"undefined"}`],
        [{foo: [void 0,,3]}, KVON.replacers.all, null, `{"foo":{"$":"Array","props":{"0":{"$":"undefined"},"2":3}}}`]


        // TODO: replacer: (string|number)[]
        // TODO: replacer: Replacer[]
        // TODO: space: 4
        // TODO: space: 2
        // TODO: space: 0
        // TODO: space: '---'
        // TODO: space: '[x]'
    ];

    tests.forEach(test => {
        let [value, replacer, space, result] = <[{}, any, any, string]>test;
        it(result, () => {
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
