'use strict';
import * as babel from 'babel';
import {Node} from "babel-types";             // Elided (used only for types)
import {Visitor, Binding} from "babel-traverse";    // Elided (used only for types)
import IL from './il';
import transformToIL from './transform-to-il';
import Task from './task';





// TODO: ... doc... Options param?
export function parse(code: string): Node {

    // TODO: Get the AST...
    let plugins = [
        'transform-es2015-destructuring',
        augmentNodesWithScopeInfo
    ];
    let b: typeof babel; // TODO: hack!
    let ast = babel.transform(code, {plugins}).ast;
    return ast;
}





// TODO: augment nodes with scope info...
declare module 'babel-types' {
    interface Node {
        scope?: ScopeInfo;
    }
}





// TODO: ...
export type ScopeInfo = {[name: string]: 'var'|'let'|'const'|'hoisted'|'param'|'module'}; // TODO: improve this struct...





// TODO: ...
export default function createTask(code: string): Task {

    // TODO: Get the AST...
    let plugins = [
        'transform-es2015-destructuring',
        augmentNodesWithScopeInfo,
        (babel) => (b = babel, {})
    ];
    let b: typeof babel; // TODO: hack!
    let ast = <File> babel.transform(code, {plugins}).ast;

    // TODO: Generate the task...
    let il = new IL(code);
    transformToIL(b, ast.program, il);
    let newSrc = il.compile();
    let result = newSrc;
    return <any> result; // TODO: !!! not a task !!!
}





// TODO: doc... define a babel plugin that collects all scope info
let augmentNodesWithScopeInfo = () => ({
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
            if (path.scope.block !== path.node) return;
            let idNames = Object.keys(path.scope.bindings);
            let idKinds = idNames.map(name => path.scope.bindings[name].kind);
            let scope = idNames.reduce((ids, name, i) => (ids[name] = idKinds[i], ids), {});
            path.node.scope = scope;
        }
    }
});
