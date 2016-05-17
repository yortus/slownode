'use strict';
import {Node, File} from "babel-types";             // Elided (used only for types)
import Task from './task';
import IL from './il';
import transformToIL from './transform-to-il';




// TODO: ...
export function emit(code: string, ast: Node): Task {
    // TODO: Generate the task...
    let il = new IL(code);
    transformToIL((<File> ast).program, il);
    let newSrc = il.compile();
    let result = newSrc;
    return <any> result; // TODO: !!! not a task !!!
}
