'use strict';
import Interpreter from '../bytecode/interpreter';





interface API {
    create(script: string, options: WorkflowOptions): Workflow;
    createPool(dirname: string, options: WorkflowOptions): WorkflowPool;

    fromJSON(json: string, options: WorkflowOptions): Workflow;
    toJSON(workflow: Workflow): string;

    save(filename: string, workflow: Workflow): Promise<void>;
    load(filename: string): Workflow;
    delete(filename: string): Promise<void>;
}





export class Workflow extends Promise<void> {}





export interface WorkflowOptions {
    preStep?: (interpreter: Interpreter) => void|Promise<void>;
    postStep?: (interpreter: Interpreter) => void|Promise<void>;
}





export interface Epoch {
    workflows: Workflow[];

    add(script: string): void;
}
