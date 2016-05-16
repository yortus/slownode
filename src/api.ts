'use strict';
import Task from './task';
import {parse} from './compiler-front-end';
import {emit} from './compiler-back-end';





// TODO: ...
export function createTask(code: string, options: CreateTaskOptions): Task {
    let ast = parse(code);
    let task = emit(ast);
    return task;
}





// TODO: ...
export function createTaskFromFile(filename: string, options: CreateTaskOptions): Task {
    throw new Error(`Not implemented`);
}





// TODO: ...
export interface CreateTaskOptions {

}
