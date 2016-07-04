import * as fs from 'fs';
import * as path from 'path';
import slownode, {Epoch} from 'slownode';





// TODO: ...
let script01 = fs.readFileSync(path.join(__dirname, './fixtures/script01.ts'), 'utf8');





// TODO: ...
slownode.eval(script01);
slownode.on('error', (err, scriptId) => {
    console.log(`Error evaluating script '${scriptId}':`);
    console.log(err);
});
