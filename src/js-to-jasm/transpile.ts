'use strict';
import {parse} from './front-end';
import {emit} from './back-end';
import JASM from '../jasm/program';





export default function transpile(javaScriptSource: string): JASM {
    let ast = parse(javaScriptSource);
    let result = emit(javaScriptSource, ast);
    return result;
}
