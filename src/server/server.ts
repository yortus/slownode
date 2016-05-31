'use strict';
import ServerOptions from './server-options';
import Interpreter from '../jasm/interpreter';
import transpile from '../js-to-jasm/transpile';





export default class Server {
    

    // TODO: doc...
    constructor(options?: ServerOptions) {
        options = options || {};
        this._onError = options.onError || ((err, scriptName) => {
            // TODO: ...
            console.log(`Error evaluating script '${scriptName}':`);
            console.log(err);
            process.exit(-1); // TODO: really need to kill whole process?
        });

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
    eval(script: string, scriptName?: string): void {
        scriptName = scriptName || 'Unnamed Script';
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
                this._onError(err, scriptName);
            }
        })();
    }


    // TODO: doc...
    private _onError: (err: any, scriptName: string) => void;
    

    // TODO: doc...
    private _globalFactory: () => {};
    

    // TODO: doc...
    private _step: (interpreter: Interpreter) => boolean|Promise<boolean>;
}
