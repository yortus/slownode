'use strict';





// TODO: temp testing...
let meta = {
    scopes: {
        lineage: [null, 0, 0],
        bindings: {
            0: {a: 'var'},
            1: {bbb: 'let', ccc: 'let'},
            2: {PI: 'const'}
        },

        tryBlocks: [15, 17, 35],
        catchBlocks: [16, 36],
        finallyBlocks: [18, 37]
        
    }
};





export default class Scope {

    private constructor(parent: Scope) {
        this.id = `§${Scope._counter || 0}`;
        this.parent = parent;
        ++Scope._counter;
    }


    extend() {
        return new Scope(this);
    }


    static root = new Scope(null);


    id: string;


    parent: Scope;


    private static _counter = 0;
}





// TODO: was... remove...
// export default class Scope {
//     start = 0;
//     count = 0;
//     depth = 0;
//     parent = <Scope> null;
//     children = <Scope[]> [];

//     addChild() {
//         let child = new Scope();
//         child.depth = this.depth + 1;
//         child.parent = this;
//         this.children.push(child);
//         return child;
//     }
// }
