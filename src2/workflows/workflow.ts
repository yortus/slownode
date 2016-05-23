'use strict';
import Interpreter from './bytecode/interpreter';
import WorkflowOptions from './workflow-options';





export default class Workflow {


    constructor(script: string, options: WorkflowOptions) {
        throw new Error(`Not implemented`);
    }


    saveAs(filename: string): Promise<void> {
        throw new Error(`Not implemented`);
    }


    save(): Promise<void> {
        throw new Error(`Not implemented`);
    }


    result: Promise<void>;


    private _filename: string;
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
