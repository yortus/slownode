'use strict';
import EpochOptions from './epoch-options';
import Interpreter from '../jasm/interpreter';
import Workflow from './workflow';
import {transpile} from '../js-to-jasm/index';





// TODO: ...
export default class Epoch {


    // TODO: ... use factory function?
    constructor(options: EpochOptions) {

        // TODO: create new optionsobject with all defaults set where not value was given
        let opts = this._options = <EpochOptions> {
            lib_d_ts: options.lib_d_ts || null,     // TODO
            dirname: options.dirname || null,       // TODO
            onError: options.onError || null,       // TODO
            globalFactory: options.globalFactory || (() => ({})),
            step: options.step || (interpreter => interpreter.step()),
            shouldSave: options.shouldSave || null, // TODO
            replacer: options.replacer || null,     // TODO
            reviver: options.reviver || null        // TODO
        };

        // TODO: ...
        this.workflows = [];

        // TODO: load and resume in-flight workflows from options.dirname...
    }


    // TODO: ... rename?
    add(script: string): Workflow {
        let program = transpile(script);
        let globalObject = this._options.globalFactory();
        let interpreter = new Interpreter(program, globalObject);
        let step = this._options.step;


        let workflow: Workflow = (async () => {

            // TODO: run to completion...
            try {
                while (!(await step(interpreter))) {/* no-op */}
            }
            catch (err) {
                console.log(`An error occurred: ${err}`); // TODO: temp testing...
                throw err;
            }
        })();

        this.workflows.push(workflow);
        return workflow;
    }


    // TODO: ... needed?
    workflows: Workflow[];


    private _options: EpochOptions;
}
