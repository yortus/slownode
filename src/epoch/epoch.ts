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
        this._isAborted = false;

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

        // TODO: ...
        if (this._isAborted) throw new Error(`(Epoch) cannot eval script; epoch has entered an aborted state`);

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


    // TODO: ... how do we know if/when abort() is done? return a promise?
    abort() {
        if (this._isAborted) return; // no-op if already currently paused
        this._isAborted = true;
    }


    // TODO: ...
    private runToCompletion(script: Script, filename: string) {

        // TODO: Kick off script using an IIAFE...
        (async () => {
            // TODO: run to completion...
            try {
                for (let step of script) {
                    await step();

                    // TODO: ...
                    if (this._isAborted) break;

                    // TODO: ... saving file at each AWAIT is meant as an optimisation, but has correctness issues.
                    //   The process might crash (or Epoch be aborted) at *any* PC value. But then on construction, the
                    //   scripts will be reloaded from disk and will run from their most recent save-point (an AWAIT).
                    //   Any excuted instructions after the save point but before the crash will then be re-run...
                    // SOLN? Save after *every* instruction? Mark *some* opcodes as safe to rerun, save at every non-safe opcode?
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

                // TODO: script aborted... emit something??
                if (this._isAborted) return;

                // TODO: script finished successfully...
                this.emit('end', script);
            }
            catch (err) {

                // TODO: an unhandled error bubbled up from the script...
                this.emit('error', err, script);
            }
            finally {

                // TODO: DRY!!! see copy above
                if (this._isAborted) return;

                // TODO: script finished...
                fs.unlinkSync(filename);
            }
        })();
    }


    // TODO: ...
    private _dirname: string;


    // TODO: ...
    private _isAborted: boolean;
}





// TODO: document these concepts in README...
// - unsafe
// - destructive
// - non-repeatable
// - impure
// - external effects
// - polluting
function doesNextInstructionHaveExternalEffects(script: Script) {

}

