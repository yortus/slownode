'use strict';
import * as assert from 'assert';
import * as babylon from "babylon";
import * as t from "babel-types";
import {Node} from "babel-types";
import traverse, {Visitor} from "babel-traverse";
import generate from "babel-generator";
import template = require("babel-template");
import * as babel from 'babel-core';
import Environment from './environment';
import Evaluator, {LValue} from './evaluator';
import matchNode, {RuleSet, Handler} from './match-node';
const NOT_SUPPORTED = new Error('Not supported');





export default function run(node: Node) {
    

    const environment = new Environment();
    const evaluator = new Evaluator();
    execute(node);


    function execute(node: Node) {
        matchNode(node, {

            BlockStatement: (node) => {
                node.body.forEach(execute);
            },

            ExpressionStatement: (node) => {
                let result = evaluate(node.expression).pop();
                console.log(`Expression result: ${result}`);
            },

            File: (node) => {
                execute(node.program);
            },

            Program: (node) => {
                node.body.forEach(execute);
            },

            VariableDeclaration: (node) => {
                assert(node.kind === 'var', `'let' and 'const' variable declarations are not currently supported.`);
                node.declarations.forEach(decl => {
                    if (t.isIdentifier(decl.id)) {
                        let name = decl.id.name;

                        // TODO: non-compliant! fix...
                        let binding = environment.createBinding(name);
                        if (decl.init) {
                            let value = evaluate(decl.init).pop();
                            binding.initialize(value);
                        }
                    }
                    else {
                        assert(false, `Unsupported variable declaration syntax`);
                    }
                });
            },

            WhileStatement: (node) => {
                while (true) {
                    let testValue = evaluate(node.test).pop();
                    if (!testValue) break;
                    execute(node.body);
                }
            },

            // --------------------------------------------------
            Otherwise: (node) => {
                console.log(`Unhandled: ${node.type}`);
                throw new Error(`Unhandled: ${node.type}`);
            }
        });
    }


    function evaluate(node: t.Expression): Evaluator {
        matchNode(node, {

            BinaryExpression: (node) => {
                evaluate(node.left);
                evaluate(node.right);
                evaluator.binary(node.operator);
            },

            BooleanLiteral: (node) => {
                evaluator.push(node.value);
            },

            Identifier: (node) => {
                let binding = environment.getBinding(node.name);
                let lval = new LValue(binding, 'value');
                evaluator.push(lval);
            },

            NullLiteral: (node) => {
                evaluator.push(null);
            },

            NumericLiteral: (node) => {
                evaluator.push(node.value);
            },

            StringLiteral: (node) => {
                evaluator.push(node.value);
            },

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

            // --------------------------------------------------
            Otherwise: (node) => {
                console.log(node.type);
                throw new Error(`Unhandled: ${node.type}`);
            }
        });
        return evaluator;
    }
}
