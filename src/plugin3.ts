import * as babel from 'babel';
import {Node} from "babel-types";                                   // Elided (used only for types)
import {Visitor, Binding as BabelBinding} from "babel-traverse";    // Elided (used only for types)
import * as assert from 'assert';
import IL from './il';
import matchNode from './match-node';
import Scope from './scope';
import transformToIL from './transform-to-il';





// TODO: temp testing...
interface SlowProgram {
    state: SlowProgramState;
    step(): SlowProgram;
    ready: Promise<void>;
    finished: boolean;
    sources: { [filename: string]: string };
    filename: string;
    line: number;
    column: number;
}
interface SlowProgramState {
    environment: Environment;
}
declare class Environment {
}
declare class Binding {
}





// Export the plugin factory function
export function transform(source: string): string {
    let il = new IL(source);
    
    // Define a babel plugin.
    let babelPlugin = (b: typeof babel) => {
        let t = b.types;
        let scopes = new WeakMap<Node, Scope>();
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

                    let bindings = path.scope.bindings;
                    let bindingNames = Object.keys(bindings);
                    // TODO: temp testing...
                    scopes.set(path.node, Scope.root.extend());
                    // TODO: was...scopes.set(path.node, bindingNames.map(name => bindings[name]));
                },

                // Transform the program.
                Program: {
                    exit(path) {
                        transformToIL(b, path.node, scopes, il);
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
