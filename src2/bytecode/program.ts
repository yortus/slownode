'use strict';
import {BindingKind} from "babel-types";    // Elided (used only for types)
export default Program;





/** TODO: doc... */
interface Program {


    meta: {
        scopes: ScopeInfo;
    };


    code: () => void;
}





/** TODO: doc... */
export interface ScopeInfo {
    lineage: number[];
    identifiers: {[index: number]: {[name: string]: BindingKind}};
}
