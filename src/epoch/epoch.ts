// TODO: use async 'fs' functions where possible
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
        this._dirname = path.join(process.cwd(), 'slowfiles');

        // TODO: create dir if not exists...
        try { fs.mkdirSync(this._dirname); }
        catch (err) { }

        // TODO: load/revive running scripts from storage...
        this._scriptIds = [];
        let filenames = fs.readdirSync(this._dirname);
        filenames.forEach(filename => {

            // TODO: resume script...
            let scriptId = filename.slice(0, -path.extname(filename).length);
            this._scriptIds.push(scriptId);
            filename = path.join(this._dirname, filename);
            let snapshot = fs.readFileSync(filename, 'utf8');
            let script = Script.fromSnapshot(snapshot);

            this.runScript(script, filename);
        });
    }


    // TODO: ...
    eval(source: string, scriptId?: string) {

        // TODO: ensure script ID is a valid filename...
        // TODO: better to just separate scriptId from filename, and use a GUID for filename? Less discoverable on disk...
        scriptId = scriptId || '«unidentified script»';
        scriptId = scriptId.replace(/[^a-zA-Z0-9_«»] /, '_');

        // TODO: ensure script ID is unique within epoch...
        let index = 0;
        while (true) {
            let sid = `${scriptId}${index++ || ''}`;
            if (this._scriptIds.indexOf(sid) !== -1) continue;
            scriptId = sid;
            break;
        }

        // TODO: create the script object...
        let script = new Script(source, {name: scriptId});
        this._scriptIds.push(scriptId);

        // TODO: Save the script's initial snapshot to disk...
        let filename = path.join(this._dirname, scriptId + '.slow');
        fs.writeFileSync(filename, script.snapshot(), {encoding: 'utf8'});

        // TODO: run the script...
        this.runScript(script, filename);
    }


    // TODO: ...
    private _dirname: string;


    // TODO: ...
    private _scriptIds: string[];





    // TODO: ...
    private runScript(script: Script, filename: string) {
        let scriptId = script.name;

        // TODO: Kick off script using an IIAFE...
        // TODO: do we need to keep a reference to the script/jasm/interpreter/progress after this? Why? Why not?
        (async () => {
            // TODO: run to completion...
            try {
                // TODO: saving at await points...
                for (let step of script) {
                    await step;

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
            }
            catch (err) {
                this.emit('error', err, scriptId);
            }
            finally {

                // TODO: script finished...
                this._scriptIds.splice(this._scriptIds.indexOf(scriptId), 1);
                fs.unlinkSync(filename);
            }
        })();
    }
}
