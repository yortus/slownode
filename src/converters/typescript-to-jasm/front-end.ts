import {transform} from './babel';
import {Node} from "babel-types";       // Elided (used only for types)
import {Visitor} from "babel-traverse"; // Elided (used only for types)





// TODO: ... doc... Options param?
export function parse(javaScriptSource: string): Node {

    // TODO: ...
    let plugins = [
        'syntax-async-functions',
        'transform-es2015-destructuring',
        'transform-es2015-template-literals',
        augmentNodesWithScopeInfo
    ];
    let ast = transform(javaScriptSource, {plugins}).ast;
    return ast;
}





// TODO: doc... define a babel plugin that collects all scope info and injects it into the AST
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
