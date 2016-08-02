




// TODO: ...
export default class JASM {
    constructor(public lines: Array<BlankLine | LabelLine | InstructionLine>) { }
}





// TODO: doc...
export interface Line {
    type: string;
    comment?: string;
    commentColumn?: number; // TODO: doc... zero-based
}





// TODO: doc...
export interface BlankLine extends Line {
    type: 'blank';
}





// TODO: doc...
export interface LabelLine extends Line{
    type: 'label';
    name: string;
}





// TODO: doc...
export interface InstructionLine extends Line {
    type: 'instruction';
    opcode: OpCode;
    arguments: Array<RegisterArgument | LabelArgument | ConstArgument>;
}





// TODO: doc...
export type OpCode = 'add' | 'array' | 'await' | 'b' | 'bf' | 'bt' | 'call' | 'div'
                    | 'eq' | 'false' | 'ge' | 'gt' | 'le' | 'load' | 'lt' | 'mul'
                    | 'ne' | 'neg' | 'not' | 'null' | 'number' | 'object' | 'regexp' | 'stop'
                    | 'store' | 'string' | 'sub' | 'throw' | 'true' | 'undefd';





// TODO: doc...
export interface RegisterArgument {
    type: 'register';
    name: RegisterName;
}





// TODO: doc...
export type RegisterName = 'PC' | 'ENV' | 'ERR' | '$0' | '$1' | '$2' | '$3' | '$4' | '$5' | '$6' | '$7';





// TODO: doc...
export interface LabelArgument {
    type: 'label';
    name: string;
}





// TODO: doc...
export interface ConstArgument {
    type: 'const';
    value: string | number;
}
