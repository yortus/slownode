'use strict';





// TODO: temp testing...
let meta = {
    scopes: {
        lineage: [null, 0, 0],
        identifiers: {
            0: {a: 'var'},
            1: {bbb: 'let', ccc: 'let'},
            2: {PI: 'const'}
        },

        tryBlocks: [15, 17, 35],
        catchBlocks: [16, 36],
        finallyBlocks: [18, 37]
        
    }
};





export type IdentifierList = {[name: string]: 'var'|'let'|'const'|'hoisted'|'param'};





export default class Scope {

    private constructor(index: number, identifiers: IdentifierList) {
        this.index = index;
        this.identifiers = identifiers;
    }


    index: number;


    identifiers: IdentifierList;
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
