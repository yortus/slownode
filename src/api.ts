'use strict';
import Program from './bytecode/program';
import {parse} from './compiler/frontend';
import {emit} from './compiler/backend';





// TODO: ...
export function createProgram(code: string, options?: CreateProgramOptions): Program {
    let ast = parse(code);
    let task = emit(code, ast);
    return task;
}





// TODO: ...
export function createProgramFromFile(filename: string, options?: CreateProgramOptions): Program {
    throw new Error(`Not implemented`);
}





// TODO: ...
export interface CreateProgramOptions {

}
