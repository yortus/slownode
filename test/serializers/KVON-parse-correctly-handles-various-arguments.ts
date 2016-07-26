import {KVON} from 'slownode';
import {expect} from 'chai';





describe('KVON.parse correctly handles various arguments', () => {

    let tests = [
        [`123`]

        // TODO:
        // - basics
        // - unrevived DPO
        // - reviver returns undefined (diff from JSON)
        // - training commas (diff from JSON)

    ];

    tests.forEach(test => {
        let [text, reviver, result, jsonResult] = <[string, any, {}, {}]> test;
        it(JSON.stringify(text || '"undefined"').slice(1, -1).replace(/\\\"/g, '"'), () => {

            // If expected JSON result is provided, sanity-check the actual JSON result for the same data.
            if (jsonResult) expect(jsonResult).to.deep.equal(JSON.parse(text, reviver));

            // TODO: ...
            let expected = result.startsWith('ERROR...') ? 'ERROR...' : result;
            let actual: any;
            try {
                actual = KVON.parse(text, reviver);
                if (actual === void 0) actual = '<undefined>';
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
