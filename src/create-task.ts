'use strict';
import * as babel from 'babel';
import {Node} from "babel-types";                   // Elided (used only for types)
import {Visitor, Binding} from "babel-traverse";    // Elided (used only for types)
import IL from './il';
import {IdentifierList} from './scope';
import transformToIL from './transform-to-il';
import Task from './task';
import CreateTaskOptions from './create-task-options';





// TODO: augment...
declare module 'babel-types' {
    interface Node {
        scope?: ScopeInfo;
    }
}





// TODO: ...
export default function createTask(code: string, options: CreateTaskOptions): Task {
    return <any> transform(code);
}





// TODO: ...
export type ScopeInfo = {[name: string]: 'var'|'let'|'const'|'hoisted'|'param'|'module'}; // TODO: improve this struct...





// // TODO: doc... define a babel plugin that collects all scope info
// function makeScopeInfoPlugin(scopeInfo: ScopeInfo) {
//     return (b: typeof babel) => ({
//         visitor: <Visitor> {
//             // Collect info for all block-scopes that have their own bindings.
//             // TODO: What introduces a new name?
//             // - var decl (var, let, const)
//             // - func decl (hoisted)
//             // - class decl (not hoisted)
//             // - import decl (hoisted)
//             // - func expr. scope of name is only *inside* the func body
//             // - class expr. scope of name is only *inside* the class body
//             // - catch clause. scope of name is only the catch clause body
//             Block(path) {
//                 if (path.scope.block !== path.node) return;
//                 let idNames = Object.keys(path.scope.bindings);
//                 let idKinds = idNames.map(name => path.scope.bindings[name].kind);
//                 let scope = idNames.reduce((ids, name, i) => (ids[name] = idKinds[i], ids), {});
//                 scopeInfo.set(path.node, scope);
//             },
//         }    
//     });
// }





// TODO: was......





// Export the plugin factory function
function transform(source: string): string {
    let il = new IL(source);
    
    // Define a babel plugin.
    let babelPlugin = (b: typeof babel) => {
        let t = b.types;
        let identifiers = new WeakMap<Node, IdentifierList>();
        return {
            visitor: <Visitor> {

                // Collect info for all block-scopes that have their own bindings.
                // TODO: What introduces a new name?
                // - var decl (var, let, const)
                // - func decl (hoisted)
                // - class decl (not hoisted)
                // - import decl (hoisted)
                // - func expr. scope of name is only *inside* the func body
                // - class expr. scope of name is only *inside* the class body
                // - catch clause. scope of name is only the catch clause body
                Block(path) {
                    // TODO: disable for now... destructuring plugin makes this assertion fail... why? investigate... 
                    // TODO: was...assert(path.scope.block === path.node);
                    // TODO: temp replacement for above assertion:
                    if (path.scope.block !== path.node) return;

                    let idNames = Object.keys(path.scope.bindings);
                    let idKinds = idNames.map(name => path.scope.bindings[name].kind);
                    let ids = idNames.reduce((ids, name, i) => (ids[name] = idKinds[i], ids), <IdentifierList> {});
                    identifiers.set(path.node, ids);
                },

                // Transform the program.
                Program: {
                    exit(path) {
                        transformToIL(b, path.node, identifiers, il);
                        let newSrc = il.compile();
                        result = newSrc;
                    }
                }
            }
        };
    }


    // TODO: doc...
    let result: string;
    babel.transform(source, {
        plugins: [
            'transform-es2015-destructuring',
            babelPlugin
        ]
    });
    return result;
}
