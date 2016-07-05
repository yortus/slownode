import {KVON} from 'slownode';
import {expect} from 'chai';





describe('KVON round-trip serialization restores the original value', () => {

    let tests = [
        ['string',                  `foo\nbar  "baz"    'nunchucks'\r\n\\\\\`     \t    blah \u0042 \\u0042`],
        ['number',                  3.141592e-27],
        ['true',                    true],
        ['false',                    true],
        ['null',                    true],
        ['plain object',            {foo: 42, 'ba`r': "bar", baz$$: false}],
        ['plain array',             [1,2,3,"abc", false, null, undefined, 42]],
        ['undefined',               void 0],
        ['NaN',                     NaN],
        ['Infinity',                Infinity],
        ['-Infinity',               -Infinity],
        ['negative zero',           -0],
        ['nested object/array',     {foo: [1,2,{a:9, b: ['c', 'd']}], bar: {baz:['quux', [[[]]]]}}],
        ['RegExp',                  /^\\.*?[\s\S]F(O|o+)$/gi],
        ['circular object',         (() => { let o = {x: 123, y: <any>[1,2]}; o.y.push({self: o}); return o; })()],
        ['object with $type key',   {$type: '$type is reserved', other: ['things', 'and', 'stuff']}],
        // TODO: add more...
        // - Holey array
        // - Date
        // - Error
        // - Map
        // - Set
        // - WeakMap
        // - WeakSet
        // - Symbol
        // - Function
        // - Promise
        // - GeneratorFunction
        // - GeneratorObject
        // - Iterator

    ];

    tests.forEach(test => {
        let [name, value] = <[string, any]>test;
        it(name, () => {
            // TODO: add try/catch?
            let expected = value;
            let kvon = KVON.stringify(value);
            let actual = KVON.parse(kvon);
            expect(actual).to.deep.equal(expected);
        });
    });
});
