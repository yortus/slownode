'use strict';
import * as assert from 'assert';
import * as babylon from "babylon";
import * as t from "babel-types";
import {Node} from "babel-types";
import traverse, {Visitor} from "babel-traverse";
import generate from "babel-generator";
import template = require("babel-template");
import * as babel from 'babel-core';
import EvaluationStack from './evaluation-stack';
import Scope from './scope';
import matchNode, {RuleSet, Handler} from './match-node';
const NOT_SUPPORTED = new Error('Not supported');





export default function run(node: Node) {
    

    const scope = new Scope();
    const evalStack = new EvaluationStack();
    execute(node);


    function execute(node: Node) {
        matchNode(node, {

            BlockStatement: (node) => {
                node.body.forEach(execute);
            },

            ExpressionStatement: (node) => {
                evaluate(node.expression);
                let result = evalStack.pop();
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
                    let name: string;
                    if (t.isIdentifier(decl.id)) name = decl.id.name;
                    assert(name, `Unsupported variable declaration syntax`);
                    if (!scope.existsLocal(name)) scope.createLocal(name);
                    if (decl.init) {
                        let value = evaluate(decl.init).pop();
                        scope.setValue(name, value);
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


    function evaluate(node: t.Expression) {
        matchNode(node, {

            BinaryExpression: (node) => {
                evaluate(node.left);
                evaluate(node.right);
                evalStack.binary(node.operator);
            },

            BooleanLiteral: (node) => {
                evalStack.push(node.value);
            },

            Identifier: (node) => {
                let value = scope.getValue(node.name);
                evalStack.push(value);
            },

            NullLiteral: (node) => {
                evalStack.push(null);
            },

            NumericLiteral: (node) => {
                evalStack.push(node.value);
            },

            StringLiteral: (node) => {
                evalStack.push(node.value);
            },

            UpdateExpression: (node) => {
                if (t.isIdentifier(node.argument)) {
                    let name = node.argument.name;
                    let oldVal = scope.getValue(name);
                    let newVal = node.operator === '++' ? (oldVal + 1) : (oldVal - 1);
                    scope.setValue(name, newVal);
                    let result = node.prefix ? newVal : oldVal;
                    evalStack.push(result);
                }
                else {
                    assert(false, `update operators currently only support single identifiers as arguments`);
                }
            },            

            // --------------------------------------------------
            Otherwise: (node) => {
                console.log(node.type);
                throw new Error(`Unhandled: ${node.type}`);
            }
        });
        return evalStack;
    }
}
