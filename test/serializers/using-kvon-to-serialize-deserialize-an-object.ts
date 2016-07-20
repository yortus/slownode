import {KVON} from 'slownode';
import {expect} from 'chai';





// TODO: how to check ES6 types like Maps for deep equality?
// let m1 = new Map([['a', 1], ['b', 2]]);
// let m2 = new Map([['a', 1], ['b', 2], ['c', 3]]);
// expect(m1).to.not.deep.equal(m2); // FAIL





describe('Using KVON to serialize/deserialize an object', () => {

    let tests = [
        // TODO: temp... remove or integrate these...
        // ['!!!1', (() => { let o = {$type: [], x: [123, void 0], y: <any>[1,2], z: /.*/g}; o.y.push({o, ox: o.x}); return o; })()],
        // ['!!!2', (() => { let o = {x: 123, y: <any>[1,2]}; o.y.push({self: o}); return o; })()],
        ['!!!3', (() => { let o = {x: 123, y: <any>[1,2], z: null}; o.z = o.y; return o; })()],


        ['string',                  `foo\nbar  "baz"    'nunchucks'\r\n\\\\\`     \t    blah \u0042 \\u0042`],
        ['string with specials',    `^\u0024\\u0024---@$#^a.b.c`],
        ['number',                  3.141592e-27],
        ['true',                    true],
        ['false',                   false],
        ['null',                    null],
        ['plain object',            {foo: 42, 'ba`r': "bar", baz$$: false}],
        ['object with specials',    {"@$#\"a.b.c": 42, "$": 'bar', '$$': false, bar: '^$"$"$'}],
        ['plain array',             [1,2,3,"abc", true, false, false, null, undefined, 42, "abc", 42, undefined]],
        ['undefined',               void 0],
        ['NaN',                     NaN],
        ['Infinity',                Infinity],
        ['-Infinity',               -Infinity],
        ['negative zero',           -0],
        ['nested object/array',     {foo: [1,2,{a:9, b: ['c', 'd']}], bar: {baz:['quux', [[[]]]]}}],
        ['RegExp',                  /^\\.*?[\s\S]F(O|o+)$/gi],
        ['circular object',         (() => { let o = {x: 123, y: <any>[1,2]}; o.y.push({self: o}); return o; })()],
        ['circular object 2',       (() => { let o: any = {x: 123, 'y.z': {$:[1,2, '^'], '^': []}}; o.z = { self: [o], xref: o['y.z'].$, ar: o['y.z']['^']}; return o; })()],
        ['object with $type key',   {$type: '$type is reserved', other: ['things', 'and', 'stuff']}],
        ['sparse array 1',          [1,,,4]],
        ['sparse array 2',          (() => { let a = []; a[0] = 1; a[3] = 4; return a; })()],
        ['hybrid array',            (() => { let a: any = [1, '22/22', 3, 42]; a.p = 'foo'; a.q = null; return a; })()],
        ['hybrid sparse array',     (() => { let a = [1,2,3]; delete a[1]; a['x/y'] = {z:-9}; return a; })()],
        // TODO: add more...
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
        // - object with prototype
        ['complex object graph', (() => {
            let o = <any> {
                foo: [
                    1,
                    2,
                    {
                        a: 9,
                        b: ['c', 'd'],
                        c: [true, false, null, undefined],
                        d: [0, -0, NaN, Infinity, -Infinity],
                        e: /^[fF]oo+\n$/g,
                        f: {$type: 'secret', $val: 'password'}
                    }
                ],
                bar: {
                    baz: ['quux', [[[]]]]
                }
            };
            o.bar.baz[1][0].push(o.foo[2]);
            o.bar.baz[1].unshift(o.foo[2]);
            return o;
        })()]
    ];

    tests.forEach(test => {
        let [name, value] = <[string, any]>test;
        it(name, () => {
            // TODO: add try/catch?
            let expected = value;
            let kvon = KVON.stringify(value);
// TODO: temp testing...
//console.log(`\n\n\n\n\n${kvon}`);
            let actual = KVON.parse(kvon);
//            expect(actual).to.deep.equal(expected);
        });
    });
});
