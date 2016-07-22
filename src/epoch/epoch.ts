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
            filename = path.join(this._dirname, filename);
            let script = loadScriptFromFile(filename);
            this.runScriptToCompletion('resume', script, filename);
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
        filename = path.join(this._dirname, filename + '.slow');

        // TODO: run the script...
        this.runScriptToCompletion('start', script, filename);
    }


    // TODO: ... how do we know if/when abort() is done? return a promise?
    abort() {
        if (this._isAborted) return; // no-op if already currently paused
        this._isAborted = true;
    }


    // TODO: ...
    private async runScriptToCompletion(mode: 'start'|'resume', script: Script, filename: string) {
        try {

            // TODO: ...
            let isNextImpure = !isNextInstructionFreeOfExternalSideEffects(script);

            if (mode === 'start') {
                // TODO: Save the script's initial snapshot to disk...
                saveScriptToFile(filename, script); // TODO: what if this fails???
            }
            else /* mode === 'resume' */ {

                // throw into the script if the pending instruction is an impure one
                if (isNextImpure) {
                    await script.throw(new Error(`Cannot resume: pending instruction may have had external side-effects`)); // TODO: add special Error subclass, don't need string message then
                    // TODO: if script doesn't catch above error, it will be thrown out to here... any special handling?
                    // TODO: if script *does* catch the above error, we'll fall through to the for loop below. Is that correct?
                }
            }


            // TODO: run to completion...
            for (let step of script) {

                // TODO: doc... process may die (or epoch be aborted) while we wait here and that's ok...
                await step;

                // TODO: ...
                if (this._isAborted) break;

                // TODO: ...
                let isPrevImpure = isNextImpure;
                isNextImpure = !isNextInstructionFreeOfExternalSideEffects(script);
                if (isPrevImpure || isNextImpure) {
                    saveScriptToFile(filename, script);
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
// - irrevocable
// - critical
// - side-effects
function isNextInstructionFreeOfExternalSideEffects(script: Script) {

    // TODO: use 'AWAIT' instructions as a proxy for this condition for now... But this needs refinement...
    // TODO: what about awaiting for a DelayPromise? That is safe/resumable/has no side-effects
    let instr = script.program.lines[script.registers.get('PC')];
    let isAwait = instr.type === 'instruction' && instr.opcode.toUpperCase() === 'AWAIT';
    return !isAwait;
}





// TODO: ... make async
function saveScriptToFile(filename: string, script: Script): void {
    // TODO: use async fs function...
    fs.writeFileSync(filename, script.snapshot(), {encoding: 'utf8'});
}





// TODO: ... make async
function loadScriptFromFile(filename: string): Script {
    // TODO: use async fs function...
    let snapshot = fs.readFileSync(filename, 'utf8');
    let script = Script.fromSnapshot(snapshot);
    return script;
}





    // // TODO: temp testing...
    // console.log(`\n\n\n\n\n################################################################################`);
    // console.log(`PARK:\n${snapshot}`);
    // let o = Script.fromSnapshot(snapshot).registers;
    // console.log(`\n\nUNPARK:`);
    // console.log(o);
