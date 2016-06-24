import * as assert from 'assert';
import typeScriptToAst from './frontend/typescript-to-ast';
import astToJasm from './backend/ast-to-jasm';
import Jasm from '../../formats/jasm';
import staticCheck from './frontend/static-check';
import {types as t} from './babel';





// TODO: ...
export default function typeScriptToJasm(typeScriptSource: string): Jasm {

    // TODO: wrap in IIAFE, without changing line numbers)
    let wrappedSource = `(async () => {${typeScriptSource}})()`;

    // TODO: temp testing... do static checking...
    let errorCount = 0;
    let valid = staticCheck(wrappedSource, (msg, line, col) => {
        ++errorCount;

        // NB: take 1 off line to account for IIAFE prolog
        --line;

        console.log(`L${line}C${col}   ${msg}`);
        // TODO: should be... this.emit('error', `L${line}C${col}   ${msg}`, scriptId);
    });
    if (!valid) {
        // TODO: improve throw message/handling       
        throw new Error(`Static checking failed with ${errorCount} error${errorCount === 1 ? '' : 's'}`);
    }

    // TODO: parse JS->AST... fix types!
    let ast: any = typeScriptToAst(wrappedSource);
    assert(t.isFile(ast));

    // TODO: cut the IIAFE wrapper out of the AST...
    ast.program.body[0] = ast.program.body[0].expression.callee.body;

    // TODO: emit AST->JASM...
    let jasm = astToJasm(ast, typeScriptSource);
    return jasm;
}
