'use strict';
import EpochOptions from './epoch-options';
import Interpreter from '../bytecode/interpreter';
import Workflow from './workflow';





// TODO: ...
export default class Epoch {


    // TODO: ... use factory function?
    constructor(options: EpochOptions) {
        throw new Error(`Not implemented`);
    }


    // TODO: ... rename?
    add(script: string): Workflow {
        throw new Error(`Not implemented`);
    }


    // TODO: ... needed?
    workflows: Workflow[];
}
