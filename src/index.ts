'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as babylon from "babylon";
import * as t from "babel-types";
import {Node} from "babel-types";
import traverse, {Visitor, Binding} from "babel-traverse";
import generate from "babel-generator";
import template = require("babel-template");
import * as babel from 'babel-core';
import run from './interpreter';
//import ts = require("typescript");





const filename = path.join(__dirname, '../temp/temp.ts');
const source = fs.readFileSync(filename, 'utf8');
const ast = babylon.parse(source, {plugins: ["asyncFunctions", "jsx", "flow"]});
assignUniqueAddressToEveryNode(ast);
let scopes = analyzeScopes(ast);
run(ast, scopes);





// TODO: ...
declare module 'babel-types' {
    export interface Node {
        address: string;
    }
}
// TODO: assign every node a unique traceable path, compatible with lodash#get
function assignUniqueAddressToEveryNode(ast: Node) {
    traverse(ast, <Visitor> {
        enter(path) {
            let id = path.key;
            if (path.listKey) id = `${path.listKey}[${id}]`;
            if (path.parent.address) id = `${path.parent.address}.${id}`;
            path.node.address = id;
        }
    });
}





function analyzeScopes(ast: Node) {

    let scopes = new WeakMap<Node, Binding[]>();

    // What introduces a new name?
    // - var decl (var, let, const)
    // - func decl (hoisted)
    // - class decl (not hoisted)
    // - import decl (hoisted)
    // - func expr. scope of name is only *inside* the func body
    // - class expr. scope of name is only *inside* the class body
    // - catch clause. scope of name is only the catch clause body
    traverse(ast, <Visitor> {
        enter(path) {
            // console.log(`enter: ${path.node.type}`);
            if (path.scope.block === path.node) {
                let bs = path.scope.bindings;
                scopes.set(path.node, Object.keys(bs).map(name => bs[name]));
                // console.log(`  NEW BLOCK`);
                // console.log(`  bindings: ${Object.keys(bs).map(id => `${bs[id].kind} ${id}`).join(', ')}`);

            }
        }
    });
    return scopes;
}















//================================================================================
function _asyncToGenerator(fn) {
    return function () {
        var gen = fn.apply(this, arguments);
        return new Promise(function (resolve, reject) {
            function step(key: 'next'|'throw', arg?) {
                try {
                    var info = gen[key](arg);
                    var value = info.value;
                }
                catch (error) {
                    reject(error);
                    return;
                }
                if (info.done) {
                    resolve(value);
                }
                else {
                    return Promise.resolve(value).then(
                        function (value) {
                            return step("next", value);
                        },
                        function (err) {
                            return step("throw", err);
                        }
                    );
                }
            }
            return step("next");
        });
    };
}
