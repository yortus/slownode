'use strict';
import * as assert from 'assert';
import Scope from './scope';
import Register from './register';
import {VM} from './vm';





export interface Label {
    resolve(): void;
    toString(): string;
}





export default class IL implements VM {

    // Load/store/move
    LOAD(tgt: Register, obj: Register, key: Register|string|number) {
        this.addLine(`LOAD(${tgt.name}, ${obj.name}, ${key instanceof Register ? key.name : JSON.stringify(key)})`);
    }
    LOADC(tgt: Register, val: string|number|boolean|null) {
        this.addLine(`LOADC(${tgt.name}, ${JSON.stringify(val)})`);
    }
    STORE(src: Register, obj: Register, key: Register|string|number) {
        this.addLine(`STORE(${src.name}, ${obj.name}, ${key instanceof Register ? key.name : JSON.stringify(key)})`);
    }
    MOVE(tgt: Register, src: Register) {
        this.addLine(`MOVE(${tgt.name}, ${src.name})`);
    }

    // Arithmetic/logic
    ADD(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`ADD(${tgt.name}, ${lhs.name}, ${rhs.name})`); }
    SUB(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`SUB(${tgt.name}, ${lhs.name}, ${rhs.name})`); }
    MUL(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`MUL(${tgt.name}, ${lhs.name}, ${rhs.name})`); }
    DIV(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`DIV(${tgt.name}, ${lhs.name}, ${rhs.name})`); }
    NEG(tgt: Register, arg: Register) { this.addLine(`NEG(${tgt.name}, ${arg.name})`); }
    NOT(tgt: Register, arg: Register) { this.addLine(`NOT(${tgt.name}, ${arg.name})`); }

    // Compare
    EQ(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`EQ(${tgt.name}, ${lhs.name}, ${rhs.name})`); }
    NE(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`NE(${tgt.name}, ${lhs.name}, ${rhs.name})`); }
    GE(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`GE(${tgt.name}, ${lhs.name}, ${rhs.name})`); }
    GT(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`GT(${tgt.name}, ${lhs.name}, ${rhs.name})`); }
    LE(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`LE(${tgt.name}, ${lhs.name}, ${rhs.name})`); }
    LT(tgt: Register, lhs: Register, rhs: Register) { this.addLine(`LT(${tgt.name}, ${lhs.name}, ${rhs.name})`); }

    // Control
    B(line: Label|number) { this.addLine(`B(${line})`); }
    BF(line: Label|number, arg: Register) { this.addLine(`BF(${line}, ${arg.name})`); }
    BT(line: Label|number, arg: Register) { this.addLine(`BT(${line}, ${arg.name})`); }

    // Misc
    NEWARR(tgt: Register) { this.addLine(`NEWARR(${tgt.name})`); }
    NEWOBJ(tgt: Register) { this.addLine(`NEWAOB(${tgt.name})`); }
    NOOP() { this.addLine(`NOOP()`); }

    // Registers
    PC = 0;
    ENV = new Register('ENV');
    $0 = new Register('$0');
    $1 = new Register('$1');
    $2 = new Register('$2');
    $3 = new Register('$3');
    $4 = new Register('$4');
    $5 = new Register('$5');
    $6 = new Register('$6');
    $7 = new Register('$7');


    /** Allocate registers for the duration of `callback`. */
    using(callback: (...args: Register[]) => void) {
        let args: Register[] = new Array(callback.length);
        for (let i = 0; i < callback.length; ++i) {
            args[i] = this.reserveRegister();
        }
        callback(...args);
        args.forEach(arg => this.releaseRegister(arg));
    }


    /** Create a new label. */
    label(): Label {
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


    compile(): string {
        let source = this._lines.map(l => `                    ${l}`).join('\n');
        source = `
function (vm) {
    while (true) {
        try {
            with (vm) {
                switch (PC) {
${source}
                    default: throw new Error('fin'); // TODO: ...
                }
            }
        }
        catch (ex) {
            // TODO: ...
            break;
        }
    }
}
        `;
        return source;
    }


    private addLine(line: string) {
        line = `case ${`${this._lines.length}:'   `.slice(0, 6)}   ';${line};`;
        this._lines.push(line);
        return this;
    }


    private reserveRegister(): Register {
        for (let i = 0; i < 8; ++i) {
            let reg = this[`$${i}`];
            if (this._reservedRegisters.indexOf(reg) !== -1) continue;
            this._reservedRegisters.push(reg);
            return reg;
        }
        throw new Error(`Expression too complex - ran out of registers`);
    }


    private releaseRegister(reg: Register) {
        let i = this._reservedRegisters.indexOf(reg);
        this._reservedRegisters.splice(i, 1);
    }


    private _reservedRegisters: Register[] = [];


    private _lines: string[] = [];


    private _labels = 0;
}















// TODO: was... remove...
// type RValue = Register | string | number | boolean;
// export default class IL implements VM {

//     br      = (label: string) => this.addLine(`br(ꬹ${label}ꬹ)`); // TODO: weird symbol can still clash with user string. fix...
//     BF      = (label: string) => this.addLine(`bf(ꬹ${label}ꬹ)`);
//     BT      = (label: string) => this.addLine(`bt(ꬹ${label}ꬹ)`);

//     label   = (name: string) => this.addLabel(name);

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
//         source = `
// function (vm) {
//     while (true) {
//         try {
//             with (vm) {
//                 switch (pc) {
// ${source}
//                     default: throw new Error('fin');
//                 }
//             }
//         }
//         catch (ex) {
//             // TODO: ...
//             break;
//         }
//     }
// }
//         `;
//         return source;
//     }

//     private addLine(line: string) {
//         line = `case ${`${this.lines.length}:'   `.slice(0, 6)}   ';${line};`;
//         this.lines.push(line);
//         return this;
//     }

//     private addLabel(name: string) {
//         this.labels[name] = this.lines.length;
//     }

//     private lines: string[] = [];

//     private labels: {[name: string]: number} = {};

//     private scopes = [new Scope()];

//     private maxDepth = 0;
// }
