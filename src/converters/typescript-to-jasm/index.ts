import {parse} from './front-end';
import {emit} from './back-end';
import {Jasm} from '../../jasm/jasm-to-js';
import staticCheck from './static-check';





export default function typeScriptToJasm(typeScriptSource: string): Jasm {

    // TODO: wrap in IIAFE, and account for this in error line numbers...
    typeScriptSource = `(async () => {\n${typeScriptSource}\n})()`;

    // TODO: temp testing... do static checking...
    let errorCount = 0;
    let valid = staticCheck(typeScriptSource, (msg, line, col) => {
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

    // TODO: parse JS->AST...
    let ast: any = parse(typeScriptSource);

    // TODO: cut the IIAFE wrapper out of the AST...
    ast.program.body[0] = ast.program.body[0].expression.callee.body;

    // TODO: emit AST->JASM...
    let result = emit(typeScriptSource, ast);
    return result;
}
