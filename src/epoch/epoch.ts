// TODO: use async 'fs' functions where possible
// TODO: full set of emitted codes (apart from 'error'). What is common? 'done'? Check other repos for common names...
import * as fs from 'fs';
import * as path from 'path';
import {EventEmitter} from 'events';
import EpochOptions from './epoch-options';
import Script from '../script';





// TODO: ...
export default class Epoch extends EventEmitter {


    // TODO: ...
    constructor(options?: EpochOptions) {
        super();

        // Validate options
        // TODO: allow setting path as option
        this._dirname = path.join(process.cwd(), 'slowfiles');

        // TODO: create dir if it does not exist...
        try { fs.mkdirSync(this._dirname); }
        catch (err) { }

        // TODO: load/revive running scripts from storage...
        let filenames = fs.readdirSync(this._dirname);
        filenames.forEach(filename => {

            // TODO: resume script...
            filename = path.join(this._dirname, filename);
            let snapshot = fs.readFileSync(filename, 'utf8');
            let script = Script.fromSnapshot(snapshot);
            this.runToCompletion(script, filename);
        });
    }


    // TODO: ... fix signature - accept scriptIdHint and return actualScriptId (unique in epoch)
    eval(source: string, scriptName?: string) {

        // TODO: create the script object...
        scriptName = scriptName || '«unnamed script»';
        let script = new Script(source, {name: scriptName});

        // Derive a valid filename from the script name.
        // TODO: better to just use a GUID for filename? Less discoverable as to what's what on disk...
        let filename = scriptName.replace(/[^a-zA-Z0-9_«»] /, '_');

        // TODO: Save the script's initial snapshot to disk...
        filename = path.join(this._dirname, filename + '.slow');
        fs.writeFileSync(filename, script.snapshot(), {encoding: 'utf8'});

        // TODO: run the script...
        this.runToCompletion(script, filename);
    }


    // TODO: ...
    private runToCompletion(script: Script, filename: string) {

        // TODO: Kick off script using an IIAFE...
        (async () => {
            // TODO: run to completion...
            try {
                for (let step of script) {
                    await step;

                    // TODO: ...
                    let instr = script.program.lines[script.registers.get('PC')];
                    let shouldPark = instr.type === 'instruction' && instr.opcode.toUpperCase() === 'AWAIT';
                    if (shouldPark) {
                        let snapshot = script.snapshot();
                        fs.writeFileSync(filename, snapshot, {encoding: 'utf8'});

    // // TODO: temp testing...
    // console.log(`\n\n\n\n\n################################################################################`);
    // console.log(`PARK:\n${snapshot}`);
    // let o = Script.fromSnapshot(snapshot).registers;
    // console.log(`\n\nUNPARK:`);
    // console.log(o);
                    }                    
                }

                // TODO: script finished successfully... emit something?
                this.emit('end', script);
            }
            catch (err) {
                this.emit('error', err, script);
            }
            finally {

                // TODO: script finished...
                fs.unlinkSync(filename);
            }
        })();
    }


    // TODO: ...
    private _dirname: string;
}
