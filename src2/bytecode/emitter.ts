'use strict';
import * as assert from 'assert';
import {SourceLocation, BindingKind} from "babel-types"; // Elided (used only for types)
import OpCodes from './opcodes';
import Program, {ScopeInfo} from './program';
import Register from './register';
import Registers from './registers';





/** TODO: doc... */
export interface Label {
    resolve(): void;
    toString(): string;
}





/** TODO: doc... internal helper class used by compiler back end */
export default class Emitter implements OpCodes, Registers {


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

    // OPCODES: Load/store/move
    LOAD(tgt: Register, obj: Register, key: Register|string|number) {
        this.addLine(`LOAD(${tgt.name}, ${obj.name}, ${key instanceof Register ? key.name : JSON.stringify(key)});`);
    }
    LOADC(tgt: Register, val: string|number|boolean|null) {
        this.addLine(`LOADC(${tgt.name}, ${JSON.stringify(val)});`);
    }
    STORE(obj: Register, key: Register|string|number, src: Register) {
        this.addLine(`STORE(${obj.name}, ${key instanceof Register ? key.name : JSON.stringify(key)}, ${src.name});`);
    }
    MOVE(tgt: Register, src: Register) {
        this.addLine(`MOVE(${tgt.name}, ${src.name});`);
    }

    // OPCODES: Arithmetic/logic
    ADD(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`ADD(${tgt.name}, ${lhs.name}, ${rhs.name});`); }
    SUB(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`SUB(${tgt.name}, ${lhs.name}, ${rhs.name});`); }
    MUL(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`MUL(${tgt.name}, ${lhs.name}, ${rhs.name});`); }
    DIV(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`DIV(${tgt.name}, ${lhs.name}, ${rhs.name});`); }
    NEG(tgt: Register, arg: Register) { this.addLine(`NEG(${tgt.name}, ${arg.name});`); }
    NOT(tgt: Register, arg: Register) { this.addLine(`NOT(${tgt.name}, ${arg.name});`); }

    // OPCODES: Compare
    EQ(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`EQ(${tgt.name}, ${lhs.name}, ${rhs.name});`); }
    NE(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`NE(${tgt.name}, ${lhs.name}, ${rhs.name});`); }
    GE(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`GE(${tgt.name}, ${lhs.name}, ${rhs.name});`); }
    GT(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`GT(${tgt.name}, ${lhs.name}, ${rhs.name});`); }
    LE(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`LE(${tgt.name}, ${lhs.name}, ${rhs.name});`); }
    LT(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`LT(${tgt.name}, ${lhs.name}, ${rhs.name});`); }

    // OPCODES: Control
    B(line: Label|number) { this.addLine(`B(${line});`); }
    BF(line: Label|number, arg: Register) { this.addLine(`BF(${line}, ${arg.name});`); }
    BT(line: Label|number, arg: Register) { this.addLine(`BT(${line}, ${arg.name});`); }
    CALL(tgt: Register, func: Register, thís: Register, args: Register) {
        this.addLine(`CALL(${tgt.name}, ${func.name}, ${thís.name}, ${args.name});`);
    }
    QUIT() { this.addLine(`QUIT();`); }

    // OPCODES: Misc
    NEWARR(tgt: Register) { this.addLine(`NEWARR(${tgt.name});`); }
    NEWOBJ(tgt: Register) { this.addLine(`NEWOBJ(${tgt.name});`); }

    // REGISTERS
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


    /** TODO: temp testing... */
    enterScope(identifiers: {[name: string]: BindingKind}) {
        let scopeCount = this._scopes.lineage.length;
        this._scopes.lineage.push(this._currentScope);
        this._scopes.identifiers[scopeCount] = identifiers;
        this._currentScope = scopeCount;
    }
    leaveScope() {
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


    /** Create a new label. */
    newLabel(): Label {
        let value = `ℒѬҦℬℚℲℳⱵ${++this._labels}`; // Assume this string won't occur in any other way.
        let searchStartLine = this._lines.length;
        return <Label> {
            resolve: () => {
                let currentLine = this._lines.length;
                let oldValue = value;
                value = currentLine.toString();
                for (let i = searchStartLine; i < currentLine; ++i) {
                    this._lines[i] = this._lines[i].replace(oldValue, value); // Assume max one occurence per line.
                }
            },
            toString: () => value
        }
    }


    /** TODO: doc... */
    build(): Program {

        // TODO: all done... cap off... doc...
        this.sourceLocation = {
            start: this._sourceLocationAll.end,
            end: this._sourceLocationAll.end
        };
        this.QUIT();

        // TODO: doc...
        let meta = { scopes: this._scopes };

        // TODO: doc...
        let codeLines = this._lines.map((line, i) => {
            return `        ${line}${' '.repeat(Math.max(0, 58 - line.length))}  // ${this._lineScopes[i]}`;
        });
        let code = eval(`(() => {\n    switch (PC.value) {\n${codeLines.join('\n')}\n    }\n})`); // TODO: remove debugger

        // TODO: ...
        return { meta, code };
    }


    /** TODO: doc... */
    sourceLocation: SourceLocation;


    /** TODO: doc... */
    private addLine(line: string) {
        let lines: string[] = [];

        // If source code is available, interleave lines of source for which IL has been emitted so far.
        if (this._sourceLines) {
            let currentSourceLine = (this.sourceLocation || this._sourceLocationAll).start.line;
            while (this._sourceLinesEmitted < currentSourceLine) {
                lines.push(`//  ${this._sourceLines[this._sourceLinesEmitted]}`);
                ++this._sourceLinesEmitted;
            }
        }

        // TODO: ...
        lines.push(line);
        lines = lines.map((line, i) => `case ${`${this._lines.length + i}:'   `.slice(0, 6)}   ';${line}`);
        this._lines.push(...lines);
        this._lineScopes.push(...lines.map(() => this._currentScope));
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
    private _lines: string[] = [];
    private _lineScopes: number[] = [];


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
