'use strict';
import ObjectCode from './object-code';





// TODO: ... should this go -in- Program class?
export default function prettyPrint(jasm: ObjectCode): string {

    // let scopes = jasm.meta.scopes;

    // // TODO: doc...
    // let meta = `lineage: [null, ${scopes.lineage.slice(1).join(', ')}],\n`;
    // meta += 'identifiers: ' + JSON.stringify(scopes.identifiers, null, 4);
    // let metaLines = meta.split('\n');
    // metaLines = [].concat('scopes: {', metaLines.map(line => `    ${line}`), '}');


    // TODO: doc...
    let source = template
        .replace(/[ ]*\$CODELINES/, jasm.code/*.map((line, i) => `${`${i+1}:      `.slice(0, 8)}${line}`)*/.join('\n'))
        //.replace(/[ ]*\$METALINES/, metaLines.map(line => `        ${line}`).join('\n'));

    return source;
}


// TODO: temp testing...
const template = `$CODELINES`;


// TODO: was...
// const template = `{
//     meta: {
//         $METALINES
//     },
//     code: () => {
//         $CODELINES
//     },
//     data: {
//         // TODO: ...
//     }
// }`;
