// TODO: add another test file for testing snapshots...
import {Script, KVON} from 'slownode';
import {expect} from 'chai';





describe('Resuming a script from a snapshot', () => {

    let tests = [
        // `let result = 42;                                           ==> 42`,
        // `let result = 1 - 2 * (3 + 4 / 5);                          ==> -6.6`,
        // `let result = -1 / 0;                                       ==> ${KVON.stringify(-Infinity)}`,
        // `let result = 2 - '1';                                      ==> ERROR: Static checking failed...`,
        `let s: any = 'foo', result = s * 3;                        ==> ${KVON.stringify(NaN)}`,
        // `let one: any = '1', result = 2 + one;                      ==> "21"`,
        // `let one: any = '1', result = 2 - one;                      ==> 1`,
        // 'let s = "bar", result = `foo${s}baz${[1, 2, 3]}`;          ==> "foobarbaz1,2,3"',
        // `let n = 2; while (n < 1000) n = n*n; let result = n;       ==> 65536`,
        // `undeclaredVar = 1;                                         ==> ERROR: Static checking failed...`,
        // `const uninitialized;                                       ==> ERROR: Static checking failed...`,
        // `const t = undeclaredVar;                                   ==> ERROR: Static checking failed...`,
        // `let obj:any = {}, ref = obj.bar.baz;                       ==> ERROR: Cannot read property 'baz'...`,
        // TODO: add some 'unsnapshotable' things for completeness (eg Promise instances)
    ];

    tests.forEach(test => {
        let source = test.split('==>')[0].trim();
        let result = test.split('==>')[1].trim();
        let name = source.replace(/[\r\n]+/g, ' ');
        name = name.length > 40 ? name.slice(0, 37) + '...' : name;

        it(name, nodeify(async () => {
            let expectedError = result.startsWith('ERROR');
            let expected = expectedError ? result : KVON.parse(result);
            let actual;

            try {
                let script = new Script(source);
                let stepsDone = 0;
                while (true) {
                    let step = script.next();
                    if (step.done) break;
                    await step.value;
                    ++stepsDone;

                    // After every five steps, take a snapshot of the running script, destroy the
                    // script, and then replace the script with a new one created from the snapshot.
                    if (stepsDone % 5 === 0) {
//TODO: temp bug hunt...
if (stepsDone === 15) {
    debugger;
}
                        let snapshot = script.snapshot();
                        script = null;
                        script = Script.fromSnapshot(snapshot);
                    }
                }
                actual = script.registers.get('ENV')['result'];
            }
            catch (er) {
                actual = `ERROR: ${er.message}`;
                if (expectedError && expected.endsWith('...')) {
                    actual = actual.slice(0, expected.length - 3) + '...';
                }
            }
            expect(actual).to.deep.equal(expected);
        }));
    });
});





// TODO: copypasta from ../epoch.ts... put this somewhere for all to share...
function nodeify(fn: () => Promise<any>): (cb: (error?: any) => void) => void {
    return done => { fn().then(() => done(), done) };
}
