// import {KVON} from 'slownode';
// import {expect} from 'chai';





// describe('KVON.stringify correctly handles various arguments', () => {

//     let tests = [

//         // Basics
//         [345, null, null, `345`],
//         [null, null, null, `null`],
//         [true, null, null, `true`],
//         [[1,2,3], null, null, `[1,2,3]`],
//         [{a:1}, null, null, `{"a":1}`],
//         [void 0, null, null, `ERROR...(B1)`],
//         [[1, void 0, ()=>{}, 4], null, null, `ERROR...(B2)`],

//         // Indenting and whitespace
//         [null, null, 2, `null`],
//         [false, null, 2, `false`],
//         [123, null, 2, `123`],
//         ['foo', null, 2, `"foo"`],
//         [[[]], null, 2, `[\n  []\n]`],
//         [[1,2,3], null, 2, `[\n  1,\n  2,\n  3\n]`],
//         [{x:4,y:7}, null, 2, `{\n  "x": 4,\n  "y": 7\n}`],
//         [{x:[],y:[3,{foo:true}]}, null, 2, `{\n  "x": [],\n  "y": [\n    3,\n    {\n      "foo": true\n    }\n  ]\n}`],
//         [[[1]], null, 0, `[[1]]`],
//         [[[1]], null, 1, `[\n [\n  1\n ]\n]`],
//         [[[1]], null, 4, `[\n    [\n        1\n    ]\n]`],
//         [[[1]], null, 10, `[\n          [\n                    1\n          ]\n]`],
//         [[[1]], null, 11, `[\n          [\n                    1\n          ]\n]`],
//         [[[1]], null, 20, `[\n          [\n                    1\n          ]\n]`],
//         [[[2]], null, '', `[[2]]`],
//         [[[2]], null, '-', `ERROR...(I1)`, `[\n-[\n--2\n-]\n]`],
//         [[[2]], null, '    ', `[\n    [\n        2\n    ]\n]`],
//         [[[2]], null, '\t\b', `ERROR...(I2)`, `[\n\t\b[\n\t\b\t\b2\n\t\b]\n]`],
//         [[[2]], null, '[x]', `ERROR...(I3)`, `[\n[x][\n[x][x]2\n[x]]\n]`],
//         [[[2]], null, '0123456789', `ERROR...(I4)`, `[\n0123456789[\n012345678901234567892\n0123456789]\n]`],
//         [[[2]], null, '0123456789abcdef', `ERROR...(I5)`, `[\n0123456789[\n012345678901234567892\n0123456789]\n]`],

//         // Using replacers and arrays of replacers
//         [345, [], null, `345`],
//         [null, [], null, `null`],
//         [[1,2,3], [], null, `[1,2,3]`],
//         [void 0, null, null, `ERROR: (KVON) no known serialization...(R1)`],
//         [[Infinity, 0, -Infinity], null, null, `ERROR: (KVON) no known serialization...(R2)`],
//         [[Infinity, 0, -Infinity], KVON.replacers.Infinity, null, `[{"$":"Infinity"},0,{"$":"-Infinity"}]`],
//         [[NaN,-0], [KVON.replacers.NaN, KVON.replacers.Infinity], null, `ERROR: (KVON) no known serialization...(R3)`],
//         [[NaN,-0], [KVON.replacers.NaN, KVON.replacers.negativeZero], null, `[{"$":"NaN"},{"$":"-0"}]`],
//         [[,2,,5], KVON.replacers.Array, null, `{"$":"Array","props":{"1":2,"3":5}}`],
//         [undefined, KVON.replacers.undefined, null, `{"$":"undefined"}`],
//         [{foo: [void 0,,3]}, KVON.replacers.all, null, `{"foo":{"$":"Array","props":{"0":{"$":"undefined"},"2":3}}}`],
//         [123, (k, v) => 42, null, `ERROR: (KVON) replacement value must be a discriminated...(R4)`],
//         [[345, 123, 345], (k, v) => v === 345 ? {'$':'345'} : v, null, `[{"$":"345"},123,"^.0"]`],
//         [[345, 123, 345], (k, v) => v === 345 ? {'$':345} : v, null, `ERROR: (KVON) cyclic...(R5)`],
//         [[345, 123, 345], (k, v) => v === 345 ? [3,4,5] : v, null, `ERROR: (KVON) replacement...(R6)`],
//         [{$:'NaN'}, KVON.replacers.NaN, null, `{"\\u0024":"NaN"}`],
//         [{$:{$:NaN}}, KVON.replacers.NaN, null, `{"\\u0024":{"\\u0024":{"$":"NaN"}}}`],
//         [{$:{$:NaN}}, KVON.replacers.Infinity, null, `ERROR: (KVON) no known serialization...(R7)`],

//         // 'Reference' values
//         [[42, true, 'foo', 'foo', true, 42], null, null, `[42,true,"foo","foo",true,42]`], // primitives don't get refs
//         [(()=>{ let a = [1,2,3]; return {a, b: [a,2,a]}; })(), null, null, `{"a":[1,2,3],"b":["^.a",2,"^.a"]}`],
//         [
//             (()=>{ let a = [NaN, void 0]; return {x: void 0, y: [{a}], z: [[{a}]]}; })(),
//             KVON.replacers.all,
//             null,
//             `{"x":{"$":"undefined"},"y":[{"a":[{"$":"NaN"},"^.x"]}],"z":[[{"a":"^.y.0.a"}]]}`
//         ],
//         [(()=>{ let a: any = [1,2,3]; a.push(a); return a; })(), null, null, `ERROR: (KVON) cyclic object graph...`],
//         [(()=>{ let a = [7]; return {'a.b': a, 'c.d': a}; })(), null, null, `{"a.b":[7],"c.d":"^.a\\u002eb"}`],
//         [(()=>{ let a = [7]; return {'a.b': {'c.d':a}, e:a}; })(),,, `{"a.b":{"c.d":[7]},"e":"^.a\\u002eb.c\\u002ed"}`],
//         [(()=>{ let a = [7]; return {'^': {'c.d': a}, e: a}; })(), null, null, `{"^":{"c.d":[7]},"e":"^.^.c\\u002ed"}`],

//         // Cases where JSON.stringify and KVON.stringify give different results (usually due to KVON strictness)
//         [[1,,,4], null, null, `ERROR...(D1)`, `[1,null,null,4]`],
//         [undefined, null, null, `ERROR...(D2)`, `<undefined>`],
//         [[1,void 0,()=>{},4], null, null, `ERROR...(D3)`, `[1,null,null,4]`],
//         [{a:1,b:void 0,c:()=>{},d:4}, null, null, `ERROR...(D4)`, `{"a":1,"d":4}`],
//         [1234, (k, v) => void 0, null, `ERROR...(D5)`, `<undefined>`],
//         [[1,2,3,4], (k, v) => void 0, null, `ERROR...(D6)`, `<undefined>`],
//         [1234, (k, v) => typeof v === 'number' ? void 0 : v, null, `ERROR...(D7)`, `<undefined>`],
//         [[1,2,3,4], (k, v) => typeof v === 'number' ? void 0 : v, null, `ERROR...(D8)`, `[null,null,null,null]`],
//         [{a:1, b:2}, [], null, `{"a":1,"b":2}`, `{}`],
//         [{a:1, b:{a:11,b:22,c:33}}, ['a'], null, `ERROR...(D9)`, `{"a":1}`],
//         [{a:1, b:{a:11,b:22,c:33}}, ['b'], null, `ERROR...(D10)`, `{"b":{"b":22}}`],
//         [{a:1, b:{a:11,b:22,c:33}}, ['a', 'b'], null, `ERROR...(D11)`, `{"a":1,"b":{"a":11,"b":22}}`],
//         [{a:1, b:{a:11,b:22,c:33}}, ['c', 'b'], null, `ERROR...(D12)`, `{"b":{"c":33,"b":22}}`],
//         [{a:9, b:{a:11,b:22,c:33}}, ['a', 'c'], null, `ERROR...(D13)`, `{"a":9}`],
//         [{1:2,3:4}, ["1"], null, `ERROR...(D14)`, `{"1":2}`],
//         [{1:2,3:4}, [3], null, `ERROR...(D15)`, `{"3":4}`],
//         [345, ['1'], null, `ERROR...(D16)`, `345`],
//         [[1,2,3], [2], null, `ERROR...(D17)`, `[1,2,3]`],
//         [(()=>{ class Foo {}; return new Foo(); })(), null, null, `ERROR...(D18)`],
//         [(()=>{ class Foo { x = 1 }; return new Foo(); })(), null, null, `ERROR...(D19)`],
//         [(()=>{ class Foo { toJSON() { return 42; } }; return new Foo(); })(), null, null, `ERROR...(D20)`, `42`],
//         [(()=>{ return { x: 'foo', toJSON: () => 42 }; })(), null, null, `ERROR...(D21)`, `42`],
//     ];

//     tests.forEach(test => {
//         let [value, replacer, space, result, json] = <[{}, any, any, string, string]> test;
//         it(JSON.stringify(result || '"undefined"').slice(1, -1).replace(/\\\"/g, '"'), () => {

//             // If expected JSON result is provided, sanity-check the actual JSON result for the same data.
//             if (json) expect(json).to.equal(JSON.stringify(value, replacer, space) || '<undefined>');

//             // Check the actual KVON result matches the expected one, including matching errors.
//             let expected = result.startsWith('ERROR') ? result.replace(/\.\.\..*/, '...') : result;
//             let actual: any;
//             try {
//                 actual = KVON.stringify(value, replacer, space);
//                 if (actual === void 0) actual = '<undefined>';
//             }
//             catch (ex) {
//                 actual = `ERROR: ${ex.message}`;
//                 if (typeof expected === 'string' && expected.endsWith('...')) {
//                     actual = actual.slice(0, expected.length - 3) + '...';
//                 }
//             }
//             expect(actual).to.deep.equal(expected);

//             // Also verify that stringify and canStringify give consistent results.
//             let expectedCan = !result.startsWith('ERROR');
//             let actualCan = KVON.canStringify(value, replacer, space);
//             expect(actualCan).to.equal(expectedCan);
//         });
//     });
// });
