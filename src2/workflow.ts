'use strict';
import Interpreter from './bytecode/interpreter';





export default class Workflow {


    private constructor() {}


    // TODO: doc... create new workflow from workflow script source code.
    static create(code: string, options: WorkflowOptions): Workflow {
        throw new Error(`Not implemented`);
    }

    // TODO: doc... load an existing workflow from disk...
    static load(filename: string): Promise<Workflow> {
        throw new Error(`Not implemented`);
    }


    saveAs(filename: string): Promise<void> {
        throw new Error(`Not implemented`);
    }


    save(): Promise<void> {
        throw new Error(`Not implemented`);
    }


    run(): Promise<void> {
        throw new Error(`Not implemented`);
    }


    private _filename: string;
}





export interface WorkflowOptions {
    filename?: string;
    preStep?: (interpreter: Interpreter) => void|Promise<void>;
    postStep?: (interpreter: Interpreter) => void|Promise<void>;
}





try {
    var item = item.next();
    while (!item.done) {
        var value = item.value;    
        item = item.next();
    }
}
catch (ex) {
    
}



let wf = Workflow.create('var x = 1 + 1', {
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
