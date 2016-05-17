'use strict';
import {BindingKind} from "babel-types";    // Elided (used only for types)
export default Task;





/** TODO: doc... */
interface Task {


    meta: {
        scopes: ScopeInfo;
    };


    code: () => void;


    data: any;
}





/** TODO: doc... */
export interface ScopeInfo {
    lineage: number[];
    identifiers: {[index: number]: {[name: string]: BindingKind}};
}
