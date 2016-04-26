'use strict';
import * as assert from 'assert';
import * as babylon from "babylon";
import * as t from "babel-types";
import {Node} from "babel-types";
import traverse, {Visitor, Binding} from "babel-traverse";
import generate from "babel-generator";
import template = require("babel-template");
import * as babel from 'babel-core';
import Environment from './environment';
import {Options as BindingOptions} from './binding';
import Evaluator, {LValue} from './evaluator';
import matchNode, {RuleSet, Handler} from './match-node';
const NOT_SUPPORTED = new Error('Not supported');





export default function run(node: Node, scopes: WeakMap<Node, Binding[]>) {
    

    let currentNode = node;
    let environment = new Environment();
    const evaluator = new Evaluator();
//    test(node);
    execute(node);


    // function test(node: Node) {
    //     traverse(node, {
    //         enter(path) {
    //             console.log(path.node.address);
    //         }
    //     });
    // }


    function execute(node: Node) {
        let oldEnv = updateEnvironment(node);
        matchNode(node, {

            BlockStatement: (node) => {
                node.body.forEach(execute);
            },

            // BreakStatement: (node) => {/*TODO*/},
            // ClassDeclaration: (node) => {/*TODO*/},
            // ContinueStatement: (node) => {/*TODO*/},
            // DebuggerStatement: (node) => {/*TODO*/},
            // Declaration: (node) => {/*TODO*/},
            // Directive: (node) => {/*TODO*/},
            // DirectiveLiteral: (node) => {/*TODO*/},
            // DoWhileStatement: (node) => {/*TODO*/},
            // EmptyStatement: (node) => {/*TODO*/},
            // ExportAllDeclaration: (node) => {/*TODO*/},
            // ExportDefaultDeclaration: (node) => {/*TODO*/},
            // ExportNamedDeclaration: (node) => {/*TODO*/},

            ExpressionStatement: (node) => {
                let result = evaluate(node.expression).pop();
                console.log(`Expression result: ${result}`);
            },

            File: (node) => {
                execute(node.program);
            },

            // ForInStatement: (node) => {/*TODO*/},
            // ForOfStatement: (node) => {/*TODO*/},
            // ForStatement: (node) => {/*TODO*/},
            // FunctionDeclaration: (node) => {/*TODO*/},
            // IfStatement: (node) => {/*TODO*/},
            // ImportDeclaration: (node) => {/*TODO*/},
            // LabeledStatement: (node) => {/*TODO*/},
            // Noop: (node) => {/*TODO*/},

            Program: (node) => {
                node.body.forEach(execute);
            },

            // ReturnStatement: (node) => {/*TODO*/},
            // SwitchStatement: (node) => {/*TODO*/},
            // ThrowStatement: (node) => {/*TODO*/},
            // TryStatement: (node) => {/*TODO*/},

            VariableDeclaration: (node) => {
                node.declarations.forEach(decl => {


                    if (!t.isIdentifier(decl.id)) {
                        decl.id
                        //throw 1;
                        assert(false);
                    }

                    decl.id
                    


                    if (t.isIdentifier(decl.id)) {
                        let name = decl.id.name;

                        // TODO: non-compliant! fix...
                        let binding = environment.getBinding(name);
                        if (decl.init) {
                            let initValue = evaluate(decl.init).pop();

                            // TODO: messy... make the following distiction inside the Binding class, to simplify logic here...
                            if (node.kind === 'var') {
                                binding.value = initValue;
                            }
                            else {
                                binding.initialize(initValue);
                            }
                        }
                    }
                    else {
                        assert(false, `Unsupported variable declaration syntax`);
                    }
                });
            },

            // VariableDeclaration: (node) => {/*TODO*/},

            WhileStatement: (node) => {
                while (true) {
                    let testValue = evaluate(node.test).pop();
                    if (!testValue) break;
                    execute(node.body);
                }
            },

            // WithStatement: (node) => {/*TODO*/},

            // --------------------------------------------------
            Otherwise: (node) => {
                console.log(`Unhandled: ${node.type}`);
                // throw new Error(`Unhandled: ${node.type}`);
            }
        });
        environment = oldEnv;
    }


    function evaluate(node: t.Expression): Evaluator {
        matchNode(node, {

            // ArrayExpression: (node) => {/*TODO*/},
            // ArrowFunctionExpression: (node) => {/*TODO*/},
            // AssignmentExpression: (node) => {/*TODO*/},
            // AwaitExpression: (node) => {/*TODO*/},

            BinaryExpression: (node) => {
                evaluate(node.left);
                evaluate(node.right);
                evaluator.binary(node.operator);
            },

            BooleanLiteral: (node) => {
                evaluator.push(node.value);
            },

            // BindExpression: (node) => {/*TODO*/},
            // CallExpression: (node) => {/*TODO*/},
            // ClassExpression: (node) => {/*TODO*/},
            // ConditionalExpression: (node) => {/*TODO*/},
            // DoExpression: (node) => {/*TODO*/},
            // Expression: (node) => {/*TODO*/},
            // FunctionExpression: (node) => {/*TODO*/},

            Identifier: (node) => {
                let binding = environment.getBinding(node.name);
                assert(!!binding);
                let lval = new LValue(binding, 'value');
                evaluator.push(lval);
            },

            // LogicalExpression: (node) => {/*TODO*/},
            // MemberExpression: (node) => {/*TODO*/},
            // NewExpression: (node) => {/*TODO*/},

            NullLiteral: (node) => {
                evaluator.push(null);
            },

            NumericLiteral: (node) => {
                evaluator.push(node.value);
            },

            // ObjectExpression: (node) => {/*TODO*/},
            // ParenthesizedExpression: (node) => {/*TODO*/},
            // RegExpLiteral: (node) => {/*TODO*/},
            // SequenceExpression: (node) => {/*TODO*/},

            StringLiteral: (node) => {
                evaluator.push(node.value);
            },

            // Super: (node) => {/*TODO*/},
            // TaggedTemplateExpression: (node) => {/*TODO*/},
            // ThisExpression: (node) => {/*TODO*/},
            // UnaryExpression: (node) => {/*TODO*/},

            UpdateExpression: (node) => {
                if (t.isIdentifier(node.argument)) {
                    let binding = environment.getBinding(node.argument.name);
                    let lval = new LValue(binding, 'value');
                    evaluator.push(lval);
                    evaluator.update(node.operator, node.prefix);
                }
                // else if (t.isMemberExpression(node.argument)) {
                //     // TODO: ...
                // }
                else {
                    assert(false, `unsupported l-value type: ${node.argument.type}`);
                }
            },            

            // YieldExpression: (node) => {/*TODO*/},

            // --------------------------------------------------
            Otherwise: (node) => {
                console.log(`Unhandled: ${node.type}`);
                // throw new Error(`Unhandled: ${node.type}`);
            }
        });
        return evaluator;
    }


    // TODO... doc... returns 'old' environment
    function updateEnvironment(node: Node): Environment {
        let oldEnv = environment;
        if (scopes.has(node)) {
            let bindings = scopes.get(node);
            environment = environment.createInnerEnvironment();
            bindings.forEach(binding => {
                environment.createBinding(binding.identifier.name, {
                    hoisted: binding.kind === 'hoisted' || binding.kind === 'var', // TODO: what about imports?
                    immutable: binding.constant,
                    declaration: binding.path.node
                });
            });
        }
        return oldEnv;
    }
}
