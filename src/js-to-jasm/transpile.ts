'use strict';
import {parse} from './front-end';
import {emit} from './back-end';
import ObjectCode from '../jasm/object-code';





export default function transpile(javaScriptSource: string): ObjectCode {
    let ast = parse(javaScriptSource);
    let result = emit(javaScriptSource, ast);
    return result;
}
