'use strict';
import {parse} from './front-end';
import {emit} from './back-end';
import Program from '../bytecode/program';





export default function transpile(javaScript: string): Program {
    let ast = parse(javaScript);
    let result = emit(javaScript, ast);
    return result;
}
