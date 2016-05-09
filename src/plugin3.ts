// TODO: doc... elided (types only)...
import * as babel from 'babel-core';                                // Elided (used only for types)
import {Node} from "babel-types";                                   // Elided (used only for types)
import {Visitor, Binding as BabelBinding} from "babel-traverse";    // Elided (used only for types)
import * as assert from 'assert';
import IL from './il';
import matchNode from './match-node';
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
export default function (b: typeof babel) {
    let t = b.types;
    let template = b.template;
    let il = new IL();
    let scopes = new WeakMap<Node, BabelBinding[]>();
    let done = false; // TODO: doc... workaround, since babel always visits nodes added via path#replaceWith, even if we don't want it to
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
                assert(path.scope.block === path.node);
                let bindings = path.scope.bindings;
                let bindingNames = Object.keys(bindings);
                scopes.set(path.node, bindingNames.map(name => bindings[name]));
            },

            // Transform the program.
            Program: {
                exit(path) {
                    if (done) return;
                    done = true;
                    transformToIL(t, path.node, scopes, il);
                    let newSrc = il.compile();
                    let newNode = t.program([<any> template(newSrc)()]);
                    path.replaceWith(newNode);
                }
            }
        }
    };
}
