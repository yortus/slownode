'use strict';
import * as assert from 'assert';
import Scope from './scope';
import {Register} from './registers';





export default class IL {

    ldc     = (tgt: Register, value: string|number|boolean|any[]|{}) => this.addLine(`ldc(${tgt}, ${JSON.stringify(value)})`);
    ldm     = (tgt: Register, obj: Register, key: Register) => this.addLine(`ldm(${tgt}, ${obj}, ${key})`);
    stm     = (obj: Register, key: Register, src: Register) => this.addLine(`stm(${obj}, ${key}, ${src})`);


    call    = (result: Register, func: Register, args: Register[], thìs?: Register) => this.addLine(`${result} = call({func: ${func}, args: [${args}]${thìs ? `, this: ${thìs}` : ''}})`);
//    syscall = (result: Register, fn: string, ...args: Register[]) => this.addLine(`syscall(${result}, '${fn}'${args.map(arg => `, ${arg}`).join('')})`);


    newarr  = (tgt: Register) => this.addLine(`newarr(${tgt})`);




    br      = (label: string) => this.addLine(`br(ꬹ${label}ꬹ)`); // TODO: weird symbol can still clash with user string. fix...
    bf      = (label: string) => this.addLine(`bf(ꬹ${label}ꬹ)`);
    bt      = (label: string) => this.addLine(`bt(ꬹ${label}ꬹ)`);

    label   = (name: string) => this.addLabel(name);

    enterScope(bindings: any) { // TODO: handle bindings
        let scope = this.scopes[this.scopes.length - 1].addChild();
        this.scopes.push(scope);
        scope.start = this.lines.length;
        this.maxDepth = Math.max(this.maxDepth, scope.depth);
    }

    leaveScope() {
        let scope = this.scopes[this.scopes.length - 1];
        scope.count = this.lines.length - scope.start;
        if (scope.count === 0) scope.parent.children.pop(); // TODO: doc... remove scope if it is empty
        this.scopes.pop();
    }

    compile(): string {

        assert(this.scopes.length === 1 && this.scopes[0].children.length === 1);
        let rootScope = this.scopes[0].children[0];

        let maxDepth = this.maxDepth;
        let draw = this.lines.map(() => ' '.repeat(maxDepth * 2));
        traverseScope(rootScope);

        function traverseScope(scope: Scope) {
            let first = scope.start;
            let last = scope.start + scope.count - 1;
            let col = (scope.depth - 1) * 2;
            if (scope.count <= 1) {
                draw[first] = draw[first].slice(0, col) + '[' + draw[first].slice(col + 1);
            }
            else {
                draw[first] = draw[first].slice(0, col) + '┌' + draw[first].slice(col + 1);
                for (let i = first + 1; i < last; ++i) {
                    draw[i] = draw[i].slice(0, col) + '|' + draw[i].slice(col + 1);
                }
                draw[last] = draw[last].slice(0, col) + '└' + draw[last].slice(col + 1);
            }
            scope.children.forEach(traverseScope);
        }


        
        let source = this.lines.map(l => `                    ${l}`).join('\n');
        source = source.replace(/ꬹ[^\r\n]+ꬹ/g, (substr) => {
            return`${this.labels[substr.slice(1, -1)]}`;
        });
        source = source
            .split('\n')
            .map((line, i) => line.slice(0, 32) + draw[i] + line.slice(32))
            .join('\n');
        source = `
function (vm) {
    while (true) {
        try {
            with (vm) {
                switch (pc) {
${source}
                    default: throw new Error('fin');
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
        line = `case ${`${this.lines.length}:'   `.slice(0, 6)}   ';${line};`;
        this.lines.push(line);
        return this;
    }

    private addLabel(name: string) {
        this.labels[name] = this.lines.length;
    }

    private lines: string[] = [];

    private labels: {[name: string]: number} = {};

    private scopes = [new Scope()];

    private maxDepth = 0;
}
