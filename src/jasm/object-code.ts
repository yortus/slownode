'use strict';
import {BindingKind} from "babel-types";    // Elided (used only for types)
export default ObjectCode;
// TODO: make this type suitable for JSON ser/deser without further work (ie code as string, not function)





/** TODO: doc... */
interface ObjectCode {


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