import * as fs from 'fs';
import * as path from 'path';
import * as pegjs from 'pegjs';





let grammar = fs.readFileSync(path.join(__dirname, 'jasm.peg'), 'utf8'); // TODO: filename in const?
let parser = pegjs.buildParser(grammar);





// TODO: doc, remove/improve try/catch
export default function parse(jasmSource: string): Jasm {
    try {
        let jasm = parser.parse(jasmSource);
        return jasm;
    }
    catch (ex) {
        debugger;
        ex;

    }
}





export interface Jasm {
    code: Array<BlankLine | LabelLine | InstructionLine>;
    data: string;
}





export interface BlankLine {
    type: 'blank';
    comment?: string;
}





export interface LabelLine {
    type: 'label';
    name: string;
    comment?: string;
}





export interface InstructionLine {
    type: 'instruction';
    opcode: string;
    arguments: Array<{type: 'register', name: string} | {type: 'label', name: string} | {type: 'const', value: any}>;
    comment?: string;
}
