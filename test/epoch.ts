import * as fs from 'fs';
import * as path from 'path';
import slownode, {Epoch, Script} from 'slownode';
import {expect} from 'chai';





describe('an Epoch instance', () => {


    it('runs a script to completion', nodeify(async () => {

        // TODO: ...
        let script00 = ``;
        let script01 = fs.readFileSync(path.join(__dirname, './fixtures/script01.ts'), 'utf8');
        let script02 = fs.readFileSync(path.join(__dirname, './fixtures/script02.ts'), 'utf8');

        // TODO: ...
        slownode.on('error', err => {
            console.log(err);
        });
        slownode.on('end', script => {
            console.log('Finished executing script ' + script.name);
        });

        // TODO: ...
        console.log('Starting a new script...');
        slownode.eval(script02);
        // slownode.eval(script02); // 2nd copy to test filenames are uniquified...

        // TODO: ...
        let timeout = new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('Aborting epoch...');
                slownode.abort();
                reject(new Error(`abort!`));
            }, 5000);
        });

        // TODO: ...
        await Promise.all([runToCompletion(slownode), timeout]);
    }));
});





// TODO: put this somewhere for all to share...
function nodeify(fn: () => Promise<any>): (cb: (error?: any) => void) => void {
    return done => { fn().then(() => done(), done) };
}





// TODO: ... filter/check for specific scriptId
function runToCompletion(epoch: Epoch) {
    return new Promise((resolve, reject) => {
        epoch.on('end', onEnd).on('error', onError);
        function onEnd(scriptId) {
            epoch.removeListener('end', onEnd).removeListener('error', onError);
            resolve();
        };
        function onError(err, scriptId) {
            epoch.removeListener('end', onEnd).removeListener('error', onError);
            reject(err);
        };
    });
}
