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





export type IdentifierList = {[name: string]: 'var'|'let'|'const'|'hoisted'|'param'|'module'};
