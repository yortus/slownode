import {parse} from './front-end';
import {emit} from './back-end';
import ObjectCode from '../jasm/object-code';





export default function transpile(javaScriptSource: string): ObjectCode {

    // TODO: temp testing... wrap code inside IIAFE...
    javaScriptSource = `(async () => {\n\n${javaScriptSource}\n\n})();`;

    // TODO: parse JS->AST...
    let ast: any = parse(javaScriptSource);

    // TODO: cut the IIAFE wrapper out of the AST...
    ast.program.body[0] = ast.program.body[0].expression.callee.body;

    // TODO: emit AST->JASM...
    let result = emit(javaScriptSource, ast);
    return result;
}
