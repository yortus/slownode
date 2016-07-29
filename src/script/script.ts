// TODO: support Iterator#return method? Would need JASM support...
import defaultGlobalFactory from './global-factories/default';
import GlobalFactory from './global-factory';
import {JASM, KVON, Program, InstructionLine} from '../serializers';
import JasmProcessor, {Register} from './jasm-processor';
import * as typescript from './source-languages/typescript';





// TODO: ...
export default class Script implements IterableIterator<Promise<void>> {


    // TODO: doc...
    constructor(source: string, options?: ScriptOptions) {

        // Validate source and options arguments.
        this._source = source;
        this._options = options = options || {};
        let language = options.language = options.language || 'typescript';
        this.name = options.name = options.name || '«anonymous script»';
        this._globalFactory = defaultGlobalFactory; // TODO: allow other options?

        // Create a JASM processor for executing the script step-by-step.
        let processor = this._processor = new JasmProcessor();

        // TODO: ...
        if (language === 'jasm+kvon') {

            // TODO: decode source...
            let matches = source
                .replace(/(?:\r\n)|\r/g, '\n')
                .match(/^\.NAME\n([^\n]+)\n\.CODE\n([\s\S]+?)\n\.DATA\n([\s\S]+)$/);
            if (matches === null) throw new Error(`Invalid snapshot format`);
            let [, name, jasm, kvon] = matches;

            // TODO: ...
            this.name = name;
            this._jasm = jasm;
            this.program = JASM.parse(jasm);

            // TODO: how to validate this is the same factory that was used when the snapshot was created? E.g. use https://github.com/puleos/object-hash
            let reviver = makeReviver(this._globalFactory);
            
            let data = KVON.parse(kvon, reviver); // TODO: validate data is an object with *all* registers defined as keys
            let registers = Object.keys(data).reduce((map, key) => (map.set(key, data[key])), new Map());
            this.registers = this._processor.registers = registers;
        }
        else {

            // TODO: only TypeScript is supported for now...
            let transpileToJasm = language === 'typescript' ? typescript.transpileToJasm : null;
            if (!transpileToJasm) throw new Error(`Unsupported script source language '${language}'`);

            // TODO: language-independent steps...
            let jasm = this._jasm = transpileToJasm(source);
            this.program = JASM.parse(jasm);
            this.registers = processor.registers;

            // TODO: create global and set ENV
            let globalObject = this._globalFactory.create();
            this.registers.set('ENV', globalObject);
        }

        // TODO: universal steps...
        this.next = makeNextFunction(this.program, this._processor);
        this.throw = makeThrowFunction(this.program, this._processor);
    }


    // TODO: ...
    static fromSnapshot(snapshot: string) {
        // TODO: ...
        return new Script(snapshot, {language: 'jasm+kvon'});
    }


    // TODO: ...
    snapshot(): string {
        let replacer = makeReplacer(this._globalFactory); // TODO: don't create new replacer on every call...
        let regNames = [...this.registers.keys()];
        let data = regNames.reduce((obj, regName) => (obj[regName] = this.registers.get(regName), obj), {});
        let jasm = this._jasm, kvon = KVON.stringify(data, replacer);
        let snapshot = `.NAME\n${JSON.stringify(this._options.name)}\n.CODE\n${jasm}\n.DATA\n${kvon}`;
        return snapshot;
    }


    // TODO: ...
    // canSnapshot(): boolean {

    //     // TODO: implement...
    //     // - if it was true before prev step, just need to check if prev instruction introduced a nonserializable value (via register assignment)
    //     // - if it was false before prev step, we have to check the whole state graph, since we don't track nonserializable values once they enter the system.
    // }


    // TODO: ...
    name: string;


    // TODO: ...
    program: Program;


    // TODO: ...
    registers: Map<Register, any>;


    // TODO: ...
    next: () => IteratorResult<Promise<void>>;


    // TODO: ...
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
    private _jasm: string;


    // TODO: ...
    private _globalFactory: GlobalFactory;
}





// TODO: put in separate file?
export interface ScriptOptions {
    language?: 'typescript'|'jasm+kvon';
    name?: string;
}





// TODO: put in separate file?
function makeNextFunction(program: Program, processor: JasmProcessor): () => IteratorResult<Promise<void>> {

    // TODO: Associate each label with it's zero-based line number...
    let labelLines = program.lines.reduce((labels, line, i) => {
        if (line.type === 'label') labels[line.name] = i;
        return labels;
    }, {});

    // TODO: convert the program lines into a list of case statements for a switch block with the PC as the discriminant
    let switchCases = program.lines.map((line, i) => {
        switch (line.type) {
            case 'blank':
            case 'label':
                return '';
            case 'instruction':
                let opcode = line.opcode.toUpperCase();
                return `p = _.${opcode}(${line.arguments.map(arg => {
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

    // TODO: retain program comments to aid debugging... NB: An inline sourcemap to JASM (or to the original script) might be the best thing here
    switchCases = switchCases.map((line, i) => {
        if (!program.lines[i].comment) return line;
        return `${line}${' '.repeat(Math.max(0, 72 - line.length))}//${program.lines[i].comment}`;
    });

    // TODO: Eval up the next() function...
    // TODO: what if a THROW/AWAIT op rejects? It's not handled properly in the following source code...
    let _ = processor;
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

    let nextFunc = (): IteratorResult<Promise<void>> => {
        let nextInstr = program.lines[_.PC];
        let isDone = nextInstr.type === 'instruction' && nextInstr.opcode.toUpperCase() === 'STOP';
        if (isDone) return <any> {done: true};
        let value = execNext(_.PC++);
        return {done: false, value};
    };

    // TODO: ...
    return nextFunc;
}





// TODO: ...
function checkIfSnapshotable(wasSnapshotable: boolean, prevInstr: InstructionLine, registers: Map<Register, any>) {
    if (wasSnapshotable) {
        // - if instr is a CALL or NEW, and return value assigned to register is not serializable
        // - THEN set canSnapshot to `false`
        // - any other way for a non-serializable to enter system without CALL or NEW? Not if all builtin types/ops are serializable...



    }
    else {
        // - if instr potentially destroys data reachable from registers...
        //   - safe but slow: assume ANY instr can do this...
        //   - possible optimisations - but MUST doc/clarify/modify codegen assumptions here!
        //     - opcode is UNDEFD (clears registers after use)
        //     - any instr whose output register is also an input register (ie overwrites)...
        //     - any instr that executes external code that might mutate reachable data...
        // - if ALL registers are now serializable (using KVON.canStringify on whole register set)...
        // - THEN set canSnapshot to `true`
    }
}





// TODO: put in separate file?
function makeThrowFunction(program: Program, processor: JasmProcessor): (err: any) => IteratorResult<Promise<void>> {

    // TODO: doc... does this need to otherwise work like step(), return a value, etc? I think not, but think about it...
    return function iteratorThrow(err: any): IteratorResult<Promise<void>> {
        processor.registers.set('ERR', err);
        processor.THROW('ERR'); // TODO: this executes an instruction that is not in the JASM program. What happens to PC, etc??
        // TODO: ^ will throw back at caller if JASM program doesn't handle it
        // TODO: is JASM program *does* handle it, what should we return from here?
        // TODO: temp just for now...
        return { done: false, value: Promise.reject(err) };   // TODO: wrong! if script catches its error, this won't reject...
    }
}





// ==================================================================
// TODO: ... put all below into a separate dir like 'transformers'...
function makeReplacer(gf: GlobalFactory) {
    return KVON.compose(KVON.replacers.all, gf.replacer, promiseReplacer);

    function promiseReplacer(key: string, val: {}) {
        if (!val || Object.getPrototypeOf(val) !== Promise.prototype)  return val;
        let replaced = {$: 'Promise'}; // TODO: ...
        return replaced;
    }
}





// TODO: ... add in KVON.revivers.all
function makeReviver(gf: GlobalFactory) {
    return KVON.compose(KVON.revivers.all, gf.reviver, promiseReviver);

    function promiseReviver(key: string, val: any) {
        if (!val || val.$ !== 'Promise') return val;
        let revived = Promise.reject(new Error(`Epoch resumed`)); // TODO: use specific Error subclass
        return revived;
    }
}
