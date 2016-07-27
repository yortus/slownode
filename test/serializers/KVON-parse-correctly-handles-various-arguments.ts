import {KVON} from 'slownode';
import {expect} from 'chai';





describe('KVON.parse correctly handles various arguments', () => {

    let tests = [

        // Basics
        [`345`, null, 345],
        [`null`, null, null],
        [`true`, null, true],
        [`"foo"`, null, 'foo'],
        [`'foo'`, null, `ERROR...`],
        [`true`, null, true],
        [`[1,2,3]`, null, [1,2,3]],
        [`{"a":1}`, null, {a:1}],
        [`undefined`, null, `ERROR: (KVON) expected...`],
        [`()=>{}`, null, `ERROR: (KVON) expected...`],
        [123, null, "ERROR: (KVON) expected `text` to be a string..."],

        // Indenting and whitespace
        [`      \n\n\n42\t\t\t    `, null, 42],
        [`   \r{"a"\t\t\t:1,   \r\n"b-3": [-0, 0]\n} `, null, {a:1,'b-3':[-0,0]}],
        [`[\n    [\n        1\n    ]\n]`, null, [[1]]],
        [`[\n-[\n--2\n-]\n]`, null, `ERROR: (KVON) expected...`],

        // Using revivers and arrays of revivers...
        [`345`, [], 345],
        [`null`, [], null],
        [`[1,2,3]`, [], [1,2,3]],
        [`undefined`, [], `ERROR...`],
        [123, [], "ERROR: (KVON) expected `text` to be a string..."],
        [`[{"$":"NaN"},-0]`, [KVON.revivers.NaN, KVON.revivers.Infinity], [NaN,-0]],
        [`[{"$":"NaN"},{"$":"-0"}]`, [KVON.revivers.NaN, KVON.revivers.Infinity], `ERROR: (KVON) reviver failed...`],
        [`[{"$":"NaN"},{"$":"-0"}]`, [KVON.revivers.NaN, KVON.revivers.negativeZero], [NaN,-0]],
        [`{"$":"Array","props":{"1":2,"3":5}}`, KVON.revivers.Array, [,2,,5]],
        [`[,2,,5]`, KVON.revivers.Array, `ERROR: (KVON) expected...`],
        [`{"$":"undefined"}`, KVON.revivers.undefined, undefined],
        [`{"foo":{"$":"Array","props":{"0":{"$":"undefined"},"2":3}}}`, KVON.revivers.all, {foo: [void 0,,3]}],
        [`[{"$":"345"},123,"^.0"]`, (k, v) => v&&v.$ === '345' ? 345 : v, [345, 123, 345]],
        [`[{"$":"345"},123,"^"]`, (k, v) => v&&v.$ === '345' ? 345 : v, `ERROR: (KVON) invalid reference...`],
        [`[345]`, (k, v) => v === '345' ? 456 : v, [345]], // non-DPOs don't go through reviver
        [`{"\\u0024": "NaN"}`, KVON.revivers.NaN, {$: 'NaN'}],
        [`{"\\u0024": {"$":"NaN"}}`, KVON.revivers.NaN, {$: NaN}],
        [`{"$":\t\t\t"\\u004eaN"}`, KVON.revivers.NaN, NaN],
        [`{"$":\t\t\t"\\u004eaN"}`, KVON.revivers.Infinity, `ERROR: (KVON) reviver failed...`],

        // 'Reference' values
        [`[57, "^.0"]`, null, [57,57]],
        [`[57, " ^.0"]`, null, [57,' ^.0']],
        [`[57, "\\u005e.0"]`, null, [57,'^.0']],
        [`"^"`, null, `ERROR: (KVON) invalid reference...`],
        [`"[^]"`, null, `[^]`],
        [`{"a":[1,2,3,{"b":[[]]}],"b":[".^",false,"^.a.3.b", -0]}`, null, {a:[1,2,3,{b:[[]]}], b:['.^',false,[[]],-0]}],
        [`["^.1",57]`, null, 'ERROR: (KVON) invalid reference...'], // forward reference
        [`{"a":{"b":"^.a"}}`, null, 'ERROR: (KVON) invalid reference...'], // cyclic reference
        [`{"a.b":[7],"c.d":"^.a\\u002eb"}`, null, {'a.b': [7], 'c.d': [7]}],
        [`{"a.b":{"c.d":[7]},"e":"^.a\\u002eb.c\\u002ed"}`, null, {'a.b': {'c.d': [7]}, e: [7]}],
        [`{"^":{"c.d":[7]},"e":"^.^.c\\u002ed"}`, null, {'^': {'c.d': [7]}, e: [7]}],

        // Cases where JSON.parse and KVON.parse give different results
        [`[1,2,]`, null, [1,2]], // trailing comma
        [`{"a":42,}`, null, {a:42}], // trailing comma
        [`[1,2,3,4]`, (k, v) => typeof v === 'number' ? void 0 : v, [1,2,3,4], [,,,]],
        [`{"a":1}`, (k, v) => typeof v === 'number' ? void 0 : v, {"a":1}, {}],
    ];

    tests.forEach(test => {
        let [text, reviver, result, jsonResult] = <[string, any, {}, {}]> test;
        it(JSON.stringify(text || '"undefined"').slice(1, -1).replace(/\\\"/g, '"'), () => {

            // If expected JSON result is provided, sanity-check the actual JSON result for the same data.
            if (jsonResult) expect(jsonResult).to.deep.equal(JSON.parse(text, reviver));

            // TODO: ...
            let expected = result;
            let actual: any;
            try {
                actual = KVON.parse(text, reviver);
            }
            catch (ex) {
                actual = `ERROR: ${ex.message}`;
                if (typeof expected === 'string' && expected.startsWith('ERROR') && expected.endsWith('...')) {
                    actual = actual.slice(0, expected.length - 3) + '...';
                }
            }
            expect(actual).to.deep.equal(expected);
        });
    });
});
