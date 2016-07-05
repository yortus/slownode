import * as fs from 'fs';
import * as path from 'path';
import slownode, {Epoch, Script} from 'slownode';
import {expect} from 'chai';





describe('an Epoch instance', () => {


    it('runs a script to completion', nodeify(async () => {


        // TODO: ...
        let script00 = ``;
        let script01 = fs.readFileSync(path.join(__dirname, './fixtures/script01.ts'), 'utf8');


        // TODO: ...
        slownode.eval(script00);
        await runToCompletion(slownode);
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
