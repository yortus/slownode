'use strict';
import Interpreter from './bytecode/interpreter';
import Workflow from './workflow';
import WorkflowOptions from './workflow-options';





export function create(script: string, options: WorkflowOptions): Workflow {
    throw new Error(`Not implemented`);
}





export function load(filename: string): Promise<Workflow> {
    throw new Error(`Not implemented`);
}





let wf = create('var x = 1 + 1', {
    preStep: (int) => {
        int.registers.$0;
        int.registers.ENV;
    }
});


wf.run()
    .then(() => {
        console.log('success!');
    })
    .catch(err => {
        console.log('failure!');
        console.log(err);
    });
