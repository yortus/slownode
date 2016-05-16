'use strict';
export default Task;





/** TODO: doc... */
interface Task {


    meta: {
        scopes: {
            lineage: number[];
            identifiers: {
                [index: number]: IdentifierList;
            };
        };
    };


    code: () => void;


    data: any;
}





/** TODO: doc... */
export interface IdentifierList {
    [name: string]: 'var'|'let'|'const'|'hoisted'|'param';
}
