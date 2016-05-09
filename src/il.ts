'use strict';
import * as assert from 'assert';





/**
 * OPCODE           STACK
 * call(arglen)     ( a0 .. an fn -- result )
 * calli0(name)     ( -- result )
 * calli1(name)     ( a0 -- result )
 * calli2(name)     ( a0 a1 -- result )
 * get              ( name -- val)              TODO: same as getin where obj=env
 * getin            ( obj name -- val)
 * br(line)         ( -- )
 * bf(line)         ( -- )
 * bt(line)         ( -- )
 * label(name)      ( -- )
 * pop()            ( a -- )
 * push(val)        ( -- val)
 * set()            ( name val -- val)          TODO: same as setin where obj=env, and env throws when setting unknown key, but other objs allow it (proxy?)
 * setin()          ( obj name val -- val)
 */
export default class IL {
    call    = (arglen: number) => this.addLine(`call(${arglen})`);
    calli0  = (name: string) => this.addLine(`calli0('${name}')`);
    calli1  = (name: string) => this.addLine(`calli1('${name}')`);
    calli2  = (name: string) => this.addLine(`calli2('${name}')`);
    get     = () => this.addLine(`get()`);
    getin   = () => this.addLine(`getin()`);
    br      = (label: string) => this.addLine(`br(ꬹ${label}ꬹ)`); // TODO: weird symbol can still clash with user string. fix...
    bf      = (label: string) => this.addLine(`bf(ꬹ${label}ꬹ)`);
    bt      = (label: string) => this.addLine(`bt(ꬹ${label}ꬹ)`);
    label   = (name: string) => this.addLabel(name);
    pop     = () => this.addLine(`pop()`);
    push    = (val: string | number | boolean) => this.addLine(`push(${JSON.stringify(val)})`);
    roll    = (count: number) => count > 1 ? this.addLine(`roll(${count})`) : null;
    set     = () => this.addLine(`set()`);
    setin   = () => this.addLine(`setin()`);

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





class Scope {
    start = 0;
    count = 0;
    depth = 0;
    parent = <Scope> null;
    children = <Scope[]> [];

    addChild() {
        let child = new Scope();
        child.depth = this.depth + 1;
        child.parent = this;
        this.children.push(child);
        return child;
    }
}
