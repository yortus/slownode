// TODO: support Iterator#return method? Would need JASM support...
import defaultGlobalFactory from './global-factories/default';
import GlobalFactory from './global-factory';
import KVON from '../kvon';
import JasmProcessor, {RegisterName} from './jasm-processor';
import JASM, {InstructionLine, RegisterArgument} from './jasm';
import * as transformers from './kvon-transformers';
import * as typescript from './source-languages/typescript';





// TODO: put in separate file?
export interface ScriptOptions {
    language?: 'typescript'|'jasm+kvon';
    name?: string;
}





// TODO: ... put this elsewhere, like in jasm-processor.ts?
export interface RegisterSet {
    PC: any;
    ENV: any;
    ERR: any;
    $0: any;
    $1: any;
    $2: any;
    $3: any;
    $4: any;
    $5: any;
    $6: any;
    $7: any;
}





// TODO: ...
export default class Script implements IterableIterator<Promise<void>> {


    // TODO: doc... too long; move bits outside class defn to helper function...
    constructor(source: string, options?: ScriptOptions) {

        // Validate source and options arguments.
        this._source = source;
        this._options = options = options || {};
        let language = options.language = options.language || 'typescript';
        this.name = options.name = options.name || '«anonymous script»';
        let globalFactory = defaultGlobalFactory; // TODO: allow other options?

        // TODO: Create a composite replacer and reviver once per instance...
        // TODO: how to validate that _globalFactory is the same factory that was used when the snapshot was created? E.g. use https://github.com/puleos/object-hash
        this._replacer = makeReplacer(globalFactory);
        this._reviver = makeReviver(globalFactory);

        // Create a JASM processor for executing the script step-by-step.
        let processor = this._processor = new JasmProcessor();

        // TODO: ...
        if (language === 'jasm+kvon') {

            // TODO: decode source...
            let obj: any = KVON.parse(source, this._reviver);
            this.name = obj.NAME;
            this.jasm = obj.CODE;
            this.registers = obj.DATA; // TODO: validate data is an object with *all* registers defined as keys
        }
        else {

            // TODO: only TypeScript is supported for now...
            let transpileToJasm = language === 'typescript' ? typescript.transpileToJasm : null;
            if (!transpileToJasm) throw new Error(`Unsupported script source language '${language}'`);

            // TODO: language-independent steps...
            this.jasm = transpileToJasm(source);

            // TODO: create global and set ENV
            let globalObject = globalFactory.create();
            this._processor.ENV = globalObject;
        }

        // TODO: universal steps...
        this.next = this.makeNextFunction();
        this.throw = this.makeThrowFunction();
    }


    // TODO: ...
    static fromSnapshot(snapshot: string) {
        // TODO: ...
        return new Script(snapshot, {language: 'jasm+kvon'});
    }


    // TODO: ...
    snapshot(): string {
        let obj = {
            NAME: this._options.name,
            CODE: this.jasm,
            DATA: this.registers
        };
        let snapshot = KVON.stringify(obj, this._replacer, 2);
        return snapshot;
    }


    // TODO: ... initial = true. Should this be a getter?
    canSnapshot = true;


    // TODO: aka NAME...
    name: string;


    // TODO: aka CODE...
    jasm: JASM;


    // TODO: aka DATA...
    // TODO: super inefficient! Creates new obj each call, so simple things like `if (script.registers.PC === x)` in a loop will be nasty
    get registers(): RegisterSet {
        let registerNames = Object.keys(this._processor);
        let result = registerNames.reduce((res, regName) => (res[regName] = this._processor[regName], res), <any> {});
        return result;
    }
    set registers(value: RegisterSet) {
        let registerNames = Object.keys(this._processor);
        registerNames.forEach(regName => this._processor[regName] = value[regName]);
    }
    

    // TODO: ...
    next: () => IteratorResult<Promise<void>>;


    // TODO: move outside class defn to helper function...
    throw: (err: any) => IteratorResult<Promise<void>>;


    // TODO: ...
    [Symbol.iterator]() {
        return this;
    }


    // TODO: ...
    private _source: string;


    // TODO: ...
    private _options: ScriptOptions;


    // TODO: ...
    private _processor: JasmProcessor;


    // TODO: ...
    private _replacer: KVON.Replacer;
    private _reviver: KVON.Reviver;





    // TODO: too long! move outside class defn to helper function... put in separate file?
    private makeNextFunction(): () => IteratorResult<Promise<void>> {

        // TODO: Associate each label with it's zero-based line number...
        let labelLines = this.jasm.lines.reduce((labels, line, i) => {
            if (line.type === 'label') labels[line.name] = i;
            return labels;
        }, {});

        // TODO: convert the JASM lines into a list of case statements for a switch block with the PC as the discriminant
        let switchCases = this.jasm.lines.map((line, i) => {
            switch (line.type) {
                case 'blank':
                case 'label':
                    return '';
                case 'instruction':
                    let method = line.opcode.toUpperCase();
                    return `p = _.${method}(${line.arguments.map(arg => {
                        switch (arg.type) {
                            case 'register':    return `'${arg.name}'`;
                            case 'label':       return labelLines[arg.name];
                            case 'const':       return JSON.stringify(arg.value);
                            default:            let unreachable: never = arg; /* ensure all discriminants covered */
                        }
                    }).join(', ')}); `;
                default:
                    let unreachable: never = line; /* ensure all discriminants covered */
            }
        }).map((line, i) => `case ${`${i}:    `.slice(0, 6)} ${line}break;`);

        // TODO: retain JASM comments to aid debugging... NB: An inline sourcemap to JASM (or to the original script) might be the best thing here
        switchCases = switchCases.map((line, i) => {
            if (!this.jasm.lines[i].comment) return line;
            return `${line}${' '.repeat(Math.max(0, 72 - line.length))}//${this.jasm.lines[i].comment}`;
        });

        // TODO: Eval up the next() function...
        // TODO: what if a THROW/AWAIT op rejects? It's not handled properly in the following source code...
        let _ = this._processor;
        let execNextSource = `
            function execNext(pc) {
                let p;
                switch (pc) {
                    ${switchCases.join(`\n                `)}
                }
                return Promise.resolve(p);
            }
        `.split(/(?:\r\n)|\r|\n/).map(line => line.slice(8)).join('\n');
        let execNext: (pc: number) => Promise<void> = eval(`(${execNextSource})`);

        let nextFunc: (this: Script) => IteratorResult<Promise<void>> = function () {
            let nextPC = _.PC;
            let nextInstr = this.jasm.lines[_.PC];
            let isDone = nextInstr.type === 'instruction' && nextInstr.opcode === 'stop';
            if (isDone) return <any> {done: true};
            let value = execNext(_.PC++);

            //TODO: temp testing...
            value = value.then(() => {
                let prevCanSnap = this.canSnapshot;
                let nextCanSnap = prevCanSnap;
                if (nextInstr.type === 'instruction') {
                    nextCanSnap = this.computeCanSnapshot(nextInstr);
                }
//console.log(`@${nextPC}   canSnapshot: ${nextCanSnap}`);
                this.canSnapshot = nextCanSnap;
            });

            return {done: false, value};
        };

        // TODO: ...
        return nextFunc;
    }





    // TODO: too long! move outside class defn to helper function... put in separate file?
    private makeThrowFunction(): (err: any) => IteratorResult<Promise<void>> {

        // TODO: doc... does this need to otherwise work like step(), return a value, etc? I think not, but think about it...
        return function iteratorThrow(err: any): IteratorResult<Promise<void>> {
            this.processor.registers.set('ERR', err);
            this.processor.THROW('ERR'); // TODO: this executes an instruction that is not in the JASM program. What happens to PC, etc??
            // TODO: ^ will throw back at caller if JASM program doesn't handle it
            // TODO: is JASM program *does* handle it, what should we return from here?
            // TODO: temp just for now...
            return { done: false, value: Promise.reject(err) };   // TODO: wrong! if script catches its error, this won't reject...
        }
    }





    // TODO: ...
    private computeCanSnapshot(prevInstr: InstructionLine) {
        let prevCanSnapshot = this.canSnapshot;

        if (prevCanSnapshot) {
            // TODO: explain steps...
            // - if instr is a CALL or NEW, and return value assigned to register is not serializable
            // - THEN set canSnapshot to `false`
            // - any other way for a non-serializable to enter system without CALL or NEW? Not if all builtin types/ops are serializable...
            if (prevInstr.type !== 'instruction') return true;
            let opcode = prevInstr.opcode;
            if (opcode !== 'call') return true;

            let targetRegisterName = (<RegisterArgument> prevInstr.arguments[0]).name;
            return KVON.canStringify(this._processor[targetRegisterName], this._replacer);
        }
        else {
            // TODO: explain steps...
            // - if instr potentially destroys data reachable from registers...
            //   - safe but slow: assume ANY instr can do this...
            //   - possible optimisations - but MUST doc/clarify/modify codegen assumptions here!
            //     - opcode is UNDEFD (clears registers after use)
            //     - any instr whose output register is also an input register (ie overwrites)...
            //     - any instr that executes external code that might mutate reachable data...
            // - if ALL registers are now serializable (using KVON.canStringify on whole register set)...
            // - THEN set canSnapshot to `true`

            // TODO: make DRY - this is copypasta from above...
            return KVON.canStringify(this.registers, this._replacer);
        }
    }
}





// ==================================================================
// TODO: ... put all below into a separate dir like 'transformers'...
function makeReplacer(gf: GlobalFactory): KVON.Replacer {
    return KVON.compose(KVON.replacers.all, gf.replacer, promiseReplacer, transformers.replacers.JASM);

    function promiseReplacer(key: string, val: {}) {
        if (!val || Object.getPrototypeOf(val) !== Promise.prototype)  return val;

return val;

// TODO: was...
        // let replaced = {$: 'Promise'}; // TODO: ...
        // return replaced;
    }
}





// TODO: ... add in KVON.revivers.all
function makeReviver(gf: GlobalFactory): KVON.Reviver {
    return KVON.compose(KVON.revivers.all, gf.reviver, promiseReviver, transformers.revivers.JASM);

    function promiseReviver(key: string, val: any) {
        if (!val || val.$ !== 'Promise') return val;

return val;

// TODO: was...
        // let revived = Promise.reject(new Error(`Epoch resumed`)); // TODO: use specific Error subclass
        // return revived;
    }
}
