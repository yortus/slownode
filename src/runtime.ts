'use strict';
import {IdentifierList} from './scope';




// TODO: move this elsewhere...
export interface Instance {
    meta: {
        scopes: {
            lineage: number[];
            identifiers: {[index: number]: IdentifierList};
        };
    };
    code: () => void;
    data: any;
}





export function step(instance: Instance) {

    
}
