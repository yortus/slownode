'use strict';
import Program from './program';





// TODO: ... should this go -in- Program class?
export function toString(program: Program): string {

    let scopes = program.meta.scopes;

    // TODO: doc...
    let meta = `lineage: [null, ${scopes.lineage.slice(1).join(', ')}],\n`;
    meta += 'identifiers: ' + JSON.stringify(scopes.identifiers, null, 4);
    let metaLines = meta.split('\n');
    metaLines = [].concat('scopes: {', metaLines.map(line => `    ${line}`), '}');

    // TODO: doc...
    let codeLines = program.code.toString().split('\n').slice(1, -1);



    // TODO: doc...
    let source = template
        .replace(/[ ]*\$CODELINES/, codeLines.map(line => `    ${line}`).join('\n'))
        .replace(/[ ]*\$METALINES/, metaLines.map(line => `        ${line}`).join('\n'));

    // TODO: actually return a Task!!
    return source;






}
// TODO: temp testing...
const template = `{
    meta: {
        $METALINES
    },
    code: () => {
        $CODELINES
    },
    data: {
        // TODO: ...
    }
}`;





// TODO: ...
export function toJSON(task: Program): string {
    throw new Error(`Not implemented`);
}





// TODO: ...
export function fromJSON(json: string): Program {
    throw new Error(`Not implemented`);
}
