import * as fs from 'fs';
import * as path from 'path';
import Jasm from '../../formats/jasm';
import * as parser from './jasm-grammar';





// TODO: doc, remove/improve try/catch
export function parse(jasm: Jasm): JasmAst {
    try {
        let jasmAst = parser.parse(jasm.toString());
        return jasmAst;
    }
    catch (ex) {
        debugger;
        ex;

    }
}





// TODO: doc...
export interface JasmAst {
    code: Array<BlankLine | LabelLine | InstructionLine>;
    data: string;
}





// TODO: doc...
export interface BlankLine {
    type: 'blank';
    comment?: string;
}





// TODO: doc...
export interface LabelLine {
    type: 'label';
    name: string;
    comment?: string;
}





// TODO: doc...
export interface InstructionLine {
    type: 'instruction';
    opcode: string;
    arguments: Array<{type: 'register', name: string} | {type: 'label', name: string} | {type: 'const', value: any}>;
    comment?: string;
}
