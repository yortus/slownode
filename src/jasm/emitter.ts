'use strict';
import * as assert from 'assert';
import {SourceLocation, BindingKind} from "babel-types"; // Elided (used only for types)
import InstructionSet from './instruction-set';
import Label from './label';
import ObjectCode, {ScopeInfo} from './object-code';
import Register from './register';
import RegisterSet from './register-set';





/** TODO: doc... internal helper class used by compiler back end */
export default class Emitter implements InstructionSet, RegisterSet {


    /** TODO: doc... */
    constructor(source?: string) {
        if (typeof source === 'string') {

            // Keep track of the lines of source, and how many have been emitted so far.
            this._sourceLines = source.split(/(?:\r\n)|\r|\n/);
            this._sourceLinesEmitted = 0;

            // Compute a SourceLocation that encompasses the entire source.
            let lineCount = this._sourceLines.length;
            this._sourceLocationAll = {
                start: { line: 1, column: 0 },
                end: { line: lineCount, column: this._sourceLines[lineCount - 1].length }
            };
        }
        else {

            // No source was provided. Set sourceLines to null to indicate that no source is to be emitted.
            this._sourceLines = null;
        }
    }


    // Instructions: Load/store
    LOAD(tgt: Register, obj: Register, key: Register) { this.addInstr('LOAD', tgt, obj, key); }
    STORE(obj: Register, key: Register, src: Register) { this.addInstr('STORE', obj, key, src); }

    // Instructions: Arithmetic/logic
    ADD(tgt: Register, lhs: Register, rhs: Register) { this.addInstr('ADD', tgt, lhs, rhs); }
    SUB(tgt: Register, lhs: Register, rhs: Register) { this.addInstr('SUB', tgt, lhs, rhs); }
    MUL(tgt: Register, lhs: Register, rhs: Register) { this.addInstr('MUL', tgt, lhs, rhs); }
    DIV(tgt: Register, lhs: Register, rhs: Register) { this.addInstr('DIV', tgt, lhs, rhs); }
    NEG(tgt: Register, arg: Register) { this.addInstr('NEG', tgt, arg); }
    NOT(tgt: Register, arg: Register) { this.addInstr('NOT', tgt, arg); }

    // Instructions: Relational
    EQ(tgt: Register, lhs: Register, rhs: Register) { this.addInstr('EQ', tgt, lhs, rhs); }
    NE(tgt: Register, lhs: Register, rhs: Register) { this.addInstr('NE', tgt, lhs, rhs); }
    GE(tgt: Register, lhs: Register, rhs: Register) { this.addInstr('GE', tgt, lhs, rhs); }
    GT(tgt: Register, lhs: Register, rhs: Register) { this.addInstr('GT', tgt, lhs, rhs); }
    LE(tgt: Register, lhs: Register, rhs: Register) { this.addInstr('LE', tgt, lhs, rhs); }
    LT(tgt: Register, lhs: Register, rhs: Register) { this.addInstr('LT', tgt, lhs, rhs); }

    // Instructions: Control
    B(line: Label|number) { this.addInstr('B', line); }
    BF(line: Label|number, arg: Register) { this.addInstr('BF', line, arg); }
    BT(line: Label|number, arg: Register) { this.addInstr('BT', line, arg); }
    CALL(tgt: Register, func: Register, thís: Register, args: Register) { this.addInstr('CALL', tgt, func, thís, args); }
    THROW(err: Register) { this.addInstr('THROW', err); return null; }
    AWAIT(tgt: Register, arg: Register) { this.addInstr('AWAIT', tgt, arg); return null; }
    STOP() { this.addInstr('STOP'); }

    // Instructions: Data
    STRING(tgt: Register, val: string) { this.addInstr('STRING', tgt, val); }
    NUMBER(tgt: Register, val: number) { this.addInstr('NUMBER', tgt, val); }
    REGEXP(tgt: Register, pattern: string, flags: string) { this.addInstr('REGEXP', tgt, pattern, flags); }
    ARRAY(tgt: Register) { this.addInstr('ARRAY', tgt); }
    OBJECT(tgt: Register) { this.addInstr('OBJECT', tgt); }
    TRUE(tgt: Register) { this.addInstr('TRUE', tgt); }
    FALSE(tgt: Register) { this.addInstr('FALSE', tgt); }
    NULL(tgt: Register) { this.addInstr('NULL', tgt); }

    // Instructions: Meta
    PARK(...regs: Register[]) { this.addInstr('PARK', ...regs); }


    // Registers
    PC = new Register('PC');
    ENV = new Register('ENV');
    $0 = new Register('$0', FREE_REGISTER);
    $1 = new Register('$1', FREE_REGISTER);
    $2 = new Register('$2', FREE_REGISTER);
    $3 = new Register('$3', FREE_REGISTER);
    $4 = new Register('$4', FREE_REGISTER);
    $5 = new Register('$5', FREE_REGISTER);
    $6 = new Register('$6', FREE_REGISTER);
    $7 = new Register('$7', FREE_REGISTER);


    // TODO: doc...
    LABEL(label: Label) { this.addLabel(label); }


    /** TODO: temp testing... */
    enterScope(identifiers: {[name: string]: BindingKind}) {
        
        let scopeCount = this._scopes.lineage.length;
        this._scopes.lineage.push(this._currentScope);
        this._scopes.identifiers[scopeCount] = identifiers;
        this._currentScope = scopeCount;

        // TODO: temp testing...
        this.addLine(`// ===== ENTER SCOPE ${this._currentScope} ===== { ${Object.keys(identifiers).map(id => `${id}: ${identifiers[id]}`).join(', ')} }`);
    }
    leaveScope() {

        // TODO: temp testing...
        this.addLine(`// ===== LEAVE SCOPE ${this._currentScope} =====`);

        this._currentScope = this._scopes.lineage[this._currentScope];
    }
    private _scopes = <ScopeInfo> { lineage: [null], identifiers: {0: {}} };
    private _currentScope: number = 0;


    /** Allocate N registers for the duration of `callback`. */
    withRegisters(callback: (...args: Register[]) => void) {
        let args: Register[] = new Array(callback.length);
        for (let i = 0; i < callback.length; ++i) {
            args[i] = this.reserveRegister();
        }
        callback(...args);
        args.forEach(arg => this.releaseRegister(arg));
    }


    /** TODO: doc... */    
    usedRegisters(): Register[] {
        let result = [this.PC, this.ENV];
        for (let i = 0; i < 8; ++i) {
            let reg = <Register> this[`$${i}`];
            if (reg.value === FREE_REGISTER) continue;
            result.push(reg);
        }
        return result;
    }


    /** TODO: doc... */
    build(): ObjectCode {

        // TODO: all done... cap off... doc...
        this.sourceLocation = {
            start: this._sourceLocationAll.end,
            end: this._sourceLocationAll.end
        };
        this.STOP();




        this._lines = this._lines.map(line => line.trim());


        // TODO: resolve all labels
        let labels: {[name: string]: number} = {};
        let labelCount = 0;
        this._lines.forEach((line, i) => {
            let matches = line.match(/^(#[a-z0-9]+):$/i);
            if (!matches) return;
            labels[matches[1]] = i - labelCount + 1;
            ++labelCount;
        });
        this._lines = this._lines.filter(line => !line.startsWith('#'));
        this._lines = this._lines.map(line => line.replace(/#[a-z0-9]+/, name => (labels[name] || name).toString()));


        return { code: this._lines };
    }


    /** TODO: doc... */
    sourceLocation: SourceLocation;


    /** TODO: doc... */
    private addLabel(label: Label) {
        this._lines.push(`${label.name}:`);
    }


    /** TODO: doc... */
    private addInstr(name: string, ...args: Array<Register|Label|string|number>) {
        let argStrs = args.map(arg => {
            if (arg instanceof Register) return arg.name;
            else if (typeof arg === 'string') return JSON.stringify(arg).replace(/#/g, '\\u0023'); // TODO: doc... '#' is special (used for labels)
            else if (typeof arg === 'number') return JSON.stringify(arg);
            else return `${arg.name}`;
        });
        this.addLine(`${name}(${argStrs.join(', ')})`);
    }


    /** TODO: doc... */
    private addLine(line: string) {
        let lines: string[] = [];

        // If source code is available, interleave lines of source for which IL has been emitted so far.
        if (this._sourceLines) {
            let currentSourceLine = (this.sourceLocation || this._sourceLocationAll).start.line;
            while (this._sourceLinesEmitted < currentSourceLine) {
                lines.push(`// ${this._sourceLines[this._sourceLinesEmitted]}`);
                ++this._sourceLinesEmitted;
            }
        }

        // TODO: ...
        lines.push(line);
        lines = lines.map(line => `    ${line}`);
        this._lines.push(...lines);
    }


    /** TODO: doc... */
    private reserveRegister(): Register {
        for (let i = 0; i < 8; ++i) {
            let reg = <Register> this[`$${i}`];
            if (reg.value === RESERVED_REGISTER) continue;
            reg.value = RESERVED_REGISTER;
            return reg;
        }
        throw new Error(`Expression too complex - ran out of registers`);
    }


    /** TODO: doc... */
    private releaseRegister(reg: Register) {
        reg.value = FREE_REGISTER;
    }


    /** TODO: doc... */
    private _lines: string[] = []; // NB: 1-based line numbering


    /** TODO: doc... */
    private _labels = 0;


    /** TODO: doc... */
    private _sourceLines: string[];


    /** TODO: doc... */
    private _sourceLinesEmitted: number;


    /** TODO: doc... */
    private _sourceLocationAll: SourceLocation;
}





/** TODO: doc... sentinel value for unused registers */
const RESERVED_REGISTER = {};
const FREE_REGISTER = {};














// TODO: was... remove...
// export default class IL implements VM {

//     enterScope(bindings: any) { // TODO: handle bindings
//         let scope = this.scopes[this.scopes.length - 1].addChild();
//         this.scopes.push(scope);
//         scope.start = this.lines.length;
//         this.maxDepth = Math.max(this.maxDepth, scope.depth);
//     }

//     leaveScope() {
//         let scope = this.scopes[this.scopes.length - 1];
//         scope.count = this.lines.length - scope.start;
//         if (scope.count === 0 && !!scope.parent.parent) {
//             // TODO: doc... remove scope if it is empty, but NOT if this is the 'root' scope
//             scope.parent.children.pop();
//         }
//         this.scopes.pop();
//     }

//     compile(): string {

//         assert(this.scopes.length === 1 && this.scopes[0].children.length === 1);
//         let rootScope = this.scopes[0].children[0];

//         let maxDepth = this.maxDepth;
//         let draw = this.lines.map(() => ' '.repeat(maxDepth * 2));
//         traverseScope(rootScope);

//         function traverseScope(scope: Scope) {
//             if (scope.count === 0) return; // TODO: temp testing... special case possible for root scope only
//             let first = scope.start;
//             let last = scope.start + scope.count - 1;
//             let col = (scope.depth - 1) * 2;
//             if (scope.count <= 1) {
//                 draw[first] = draw[first].slice(0, col) + '[' + draw[first].slice(col + 1);
//             }
//             else {
//                 draw[first] = draw[first].slice(0, col) + '┌' + draw[first].slice(col + 1);
//                 for (let i = first + 1; i < last; ++i) {
//                     draw[i] = draw[i].slice(0, col) + '|' + draw[i].slice(col + 1);
//                 }
//                 draw[last] = draw[last].slice(0, col) + '└' + draw[last].slice(col + 1);
//             }
//             scope.children.forEach(traverseScope);
//         }


        
//         let source = this.lines.map(l => `                    ${l}`).join('\n');
//         source = source.replace(/ꬹ[^\r\n]+ꬹ/g, (substr) => {
//             return`${this.labels[substr.slice(1, -1)]}`;
//         });
//         source = source
//             .split('\n')
//             .map((line, i) => line.slice(0, 32) + draw[i] + line.slice(32))
//             .join('\n');
//         ...
//     }

//     private scopes = [new Scope()];

//     private maxDepth = 0;
// }
