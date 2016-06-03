'use strict';
import {EventEmitter} from 'events';
import {Extension} from './extensibility';





// TODO: ...
export default class Epoch extends EventEmitter {


    // TODO: ...
    constructor() {
        super();
        throw new Error(`Not implemented`);
    }


    // TODO: ...
    use(extension: Extension): Epoch {
        throw new Error(`Not implemented`);
    }


    // TODO: ...
    eval(script: string, scriptId?: string): Epoch {
        throw new Error(`Not implemented`);
    }
}
