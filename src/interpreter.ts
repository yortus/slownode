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
import matchNode, {RuleSet, Handler} from './match-node';
const NOT_SUPPORTED = new Error('Not supported');





export default function run(node: Node) {
    

    const evalStack = new EvaluationStack();
    execute(node);


    function execute(node: Node) {
        matchNode(node, {

            File: (node) => {
                execute(node.program);
            },

            Program: (node) => {
                node.body.forEach(execute);
            },

            ExpressionStatement: (node) => {
                evaluate(node.expression);
                let result = evalStack.pop();
                console.log(`Expression result: ${result}`);
            },

            Otherwise: (node) => {
                console.log(node.type);
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

            NumericLiteral: (node) => {
                evalStack.push(node.value);
            },

            Otherwise: (node) => {
                console.log(node.type);
                throw new Error(`Unhandled: ${node.type}`);
            }
        });
    }
}
