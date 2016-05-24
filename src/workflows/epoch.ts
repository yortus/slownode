'use strict';
import EpochOptions from './epoch-options';
import Interpreter from '../bytecode/interpreter';
import Workflow from './workflow';


// TODO: temp testing...
import {parse} from '../compiler/frontend';
import {emit} from '../compiler/backend';





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
            step: options.step || (interpreter => {
                let result = interpreter.step();
                return result instanceof Error ? Promise.reject(result) : Promise.resolve(result);
            }),
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

        let ast = parse(script);
        let program = emit(script, ast);
        let globalObject = this._options.globalFactory();
        let interpreter = new Interpreter(program, globalObject);
        let step = this._options.step;



        let workflow: Workflow = new Promise<void>((resolve, reject) => {

            runToCompletion();

            function runToCompletion() {

                // TODO: shouldSave? then save...
                
                step(interpreter)
                    .then(val => {
                        if (val) {
                            resolve();
                        }
                        else {
                            runToCompletion();
                        }
                    })
                    .catch(err => {
                        reject(err);
                        // TODO: use options.onError...
                    });
            }
        });

        this.workflows.push(workflow);
        return workflow;
    }


    // TODO: ... needed?
    workflows: Workflow[];


    private _options: EpochOptions;
}
