




// TODO: ...
export default Program;
interface Program {
    lines: Array<BlankLine | LabelLine | InstructionLine>;
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
    opcode: string;
    arguments: Array<RegisterArgument | LabelArgument | ConstArgument>;
}





// TODO: doc...
export interface RegisterArgument {
    type: 'register';
    name: string;
}





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
