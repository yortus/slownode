import * as fs from 'fs';
import * as path from 'path';
import slownode, {Epoch, Script} from 'slownode';





// TODO: ...
let script00 = ``;
let script01 = fs.readFileSync(path.join(__dirname, './fixtures/script01.ts'), 'utf8');





// TODO: ...
slownode.eval(script00);
slownode.on('error', (err, scriptId) => {
    console.log(`Error evaluating script '${scriptId}':`);
    console.log(err);
});
