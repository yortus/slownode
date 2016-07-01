import * as assert from 'assert';
import {SourceLocation, BindingKind} from "babel-types"; // Elided (used only for types)
import Label from './label';
import ExecutionEngine, {Register, Register as R} from '../../execution-engine/index'; // NB: explicit 'index' so loadable by both CJS & AMD





/** TODO: doc... internal helper class used by compiler back end */
export default class JasmEmitter implements ExecutionEngine {


    /** TODO: doc... */
    constructor(source?: string) {

        // Keep track of the lines of source, and how many have been emitted so far.
        this._sourceLines = source ? source.split(/(?:\r\n)|\r|\n/) : [''];
        this._sourceLinesEmitted = 0;
    }


    // Instructions: Load/store
    LOAD    (tgt: R, obj: R, key: R) { this.addInstr('LOAD', tgt, obj, key); }
    STORE   (obj: R, key: R, src: R) { this.addInstr('STORE', obj, key, src); }

    // Instructions: Arithmetic/logic
    ADD     (tgt: R, lhs: R, rhs: R) { this.addInstr('ADD', tgt, lhs, rhs); }
    SUB     (tgt: R, lhs: R, rhs: R) { this.addInstr('SUB', tgt, lhs, rhs); }
    MUL     (tgt: R, lhs: R, rhs: R) { this.addInstr('MUL', tgt, lhs, rhs); }
    DIV     (tgt: R, lhs: R, rhs: R) { this.addInstr('DIV', tgt, lhs, rhs); }
    NEG     (tgt: R, arg: R) { this.addInstr('NEG', tgt, arg); }
    NOT     (tgt: R, arg: R) { this.addInstr('NOT', tgt, arg); }

    // Instructions: Relational
    EQ      (tgt: R, lhs: R, rhs: R) { this.addInstr('EQ', tgt, lhs, rhs); }
    NE      (tgt: R, lhs: R, rhs: R) { this.addInstr('NE', tgt, lhs, rhs); }
    GE      (tgt: R, lhs: R, rhs: R) { this.addInstr('GE', tgt, lhs, rhs); }
    GT      (tgt: R, lhs: R, rhs: R) { this.addInstr('GT', tgt, lhs, rhs); }
    LE      (tgt: R, lhs: R, rhs: R) { this.addInstr('LE', tgt, lhs, rhs); }
    LT      (tgt: R, lhs: R, rhs: R) { this.addInstr('LT', tgt, lhs, rhs); }

    // Instructions: Control
    B       (line: Label|number) { this.addInstr('B', typeof line === 'number' ? lit(line) : line.name); }
    BF      (line: Label|number, arg: R) { this.addInstr('BF', typeof line === 'number' ? lit(line) : line.name, arg); }
    BT      (line: Label|number, arg: R) { this.addInstr('BT', typeof line === 'number' ? lit(line) : line.name, arg); }
    CALL    (tgt: R, func: R, thís: R, args: R) { this.addInstr('CALL', tgt, func, thís, args); }
    THROW   (err: R) { this.addInstr('THROW', err); return null; }
    AWAIT   (tgt: R, arg: R) { this.addInstr('AWAIT', tgt, arg); return null; }
    STOP    () { this.addInstr('STOP'); }

    // Instructions: Data
    STRING  (tgt: R, val: string) { this.addInstr('STRING', tgt, lit(val)); }
    NUMBER  (tgt: R, val: number) { this.addInstr('NUMBER', tgt, lit(val)); }
    REGEXP  (tgt: R, pattern: string, flags: string) { this.addInstr('REGEXP', tgt, lit(pattern), lit(flags)); }
    ARRAY   (tgt: R) { this.addInstr('ARRAY', tgt); }
    OBJECT  (tgt: R) { this.addInstr('OBJECT', tgt); }
    TRUE    (tgt: R) { this.addInstr('TRUE', tgt); }
    FALSE   (tgt: R) { this.addInstr('FALSE', tgt); }
    NULL    (tgt: R) { this.addInstr('NULL', tgt); }
    UNDEFD  (tgt: R) { this.addInstr('UNDEFD', tgt); }


    // Registers
    registers = new Map(<[R, any][]>[
        ['PC', RESERVED_REGISTER], // TODO: overkill! we don't need FREE/RESERVED here, just truthy/falsy
        ['ENV', RESERVED_REGISTER],
        ['ERR', RESERVED_REGISTER],
        ['$0', FREE_REGISTER],
        ['$1', FREE_REGISTER],
        ['$2', FREE_REGISTER],
        ['$3', FREE_REGISTER],
        ['$4', FREE_REGISTER],
        ['$5', FREE_REGISTER],
        ['$6', FREE_REGISTER],
        ['$7', FREE_REGISTER]
    ]);


    // TODO: doc...
    LABEL(label: Label) { this.addLabel(label); }


    /** TODO: temp testing... */
    enterScope(identifiers: {[name: string]: BindingKind}) {
        
        let scopeCount = this._scopes.lineage.length;
        this._scopes.lineage.push(this._currentScope);
        this._scopes.identifiers[scopeCount] = identifiers;
        this._currentScope = scopeCount;

        // TODO: temp testing...
        this.addLine(`    ; ===== ENTER SCOPE ${this._currentScope} ===== { ${Object.keys(identifiers).map(id => `${id}: ${identifiers[id]}`).join(', ')} }`);
    }
    leaveScope() {

        // TODO: temp testing...
        this.addLine(`    ; ===== LEAVE SCOPE ${this._currentScope} =====`);

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
    build(): string {

        // TODO: ...
        this.STOP();
        this._syncLines.push([this._lines.length, this._sourceLines.length]);

        // TODO: ...
        let lines: string[] = [];
        for (let i = 0; i < this._syncLines.length - 1; ++i) {
            let lstart = this._syncLines[i][0];
            let rstart = this._syncLines[i][1];
            let lcount = this._syncLines[i + 1][0] - lstart;
            let rcount = this._syncLines[i + 1][1] - rstart;

            let llines = this._lines.slice(lstart, lstart + lcount);
            let rlines = this._sourceLines.slice(rstart, rstart + rcount);
            while (llines.length < rlines.length) llines.push('');
            while (rlines.length < llines.length) rlines.push('');

            lines = lines.concat(llines.map((lline, i) => {
                let rline = rlines[i];
                if (rline.trim() === '') return lline;

                let gap = ' '.repeat(Math.max(0, 48 - lline.length));
                return `${lline}${gap}; ${rline}`;
            }));
        }

        // TODO: ...
        return `${lines.join('\n')}\n`;
    }


    /** TODO: doc... one-based */
    syncSourceLocation(sourceLine: number) {
        if (sourceLine - 1 === this._syncLines[this._syncLines.length - 1][1]) return; // TODO: explain...
        this._syncLines.push([this._lines.length, sourceLine - 1]);
    }
    private _syncLines: [number, number][] = [[0, 0]];


    /** TODO: doc... */
    private addLabel(label: Label) {
        this.addLine(`${label.name}:`);
    }


    /** TODO: doc... */
    private addInstr(name: string, ...args: string[]) {
        this.addLine(`    ${name.toLowerCase()}${' '.repeat(Math.max(0, 8 - name.length))}${args.join(', ')}`);
    }


    /** TODO: doc... */
    private addLine(line: string) {
        this._lines.push(line);
    }


    /** TODO: doc... */
    private reserveRegister(): Register {
        for (let reg of this.registers.keys()) {
            if (this.registers.get(reg) === RESERVED_REGISTER) continue;
            this.registers.set(reg, RESERVED_REGISTER);
            return reg;
        }
        throw new Error(`Expression too complex - ran out of registers`);
    }


    /** TODO: doc... */
    private releaseRegister(reg: Register) {
        this.UNDEFD(reg);
        this.registers.set(reg, FREE_REGISTER);
    }


    /** TODO: doc... */
    private _lines: string[] = [];


    /** TODO: doc... */
    private _sourceLines: string[];


    /** TODO: doc... */
    private _sourceLinesEmitted: number;
}





/** TODO: doc... sentinel value for unused registers */
const RESERVED_REGISTER = {};
const FREE_REGISTER = {};





// TODO: ...
function lit(v: string | number) {
    return JSON.stringify(v);
}




// TODO: ...
export interface ScopeInfo {
    lineage: number[];
    identifiers: {[index: number]: {[name: string]: BindingKind}};
}














// TODO: was... preserved for scope handling ideas... remove after scope handling is implemented above...
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
