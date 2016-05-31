'use strict';
import {EventEmitter} from 'events';
import ServerOptions from './server-options';
import Interpreter from '../jasm/interpreter';
import transpile from '../js-to-jasm/transpile';





export default class Server extends EventEmitter {
    

    // TODO: doc...
    constructor(options?: ServerOptions) {
        super();
        
        options = options || {};

        // TODO: temp testing...
        this._globalFactory = () => ({});
        this._step = i => i.step();
        if (options.runtime) {
            let runtime = options.runtime();
            this._globalFactory = runtime.globalFactory || this._globalFactory;
            this._step = runtime.step || this._step;
        }        
    }


    // TODO: doc...
    eval(script: string, scriptId?: string): void {
        scriptId = scriptId || '«unidentified script»';
        let jasm = transpile(script);
        let globalObject = this._globalFactory();
        let interpreter = new Interpreter(jasm, globalObject);

        // TODO: do we need to keep a reference to the script/jasm/interpreter/progress after this? Why? Why not?
        (async () => {
            // TODO: run to completion...
            try {
                while (!(await this._step(interpreter))) {/* no-op */}
            }
            catch (err) {
                this.emit('error', err, scriptId);
            }
        })();
    }
    

    // TODO: doc...
    private _globalFactory: () => {};
    

    // TODO: doc...
    private _step: (interpreter: Interpreter) => boolean|Promise<boolean>;
}
