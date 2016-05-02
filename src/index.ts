'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as babylon from "babylon";
import * as t from "babel-types";
import {Node} from "babel-types";
import traverse, {Visitor, Binding, NodePath} from "babel-traverse";
import generate from "babel-generator";
import template = require("babel-template");
import * as babel from 'babel-core';
import plugin from './plugin3';





const filename = path.join(__dirname, '../temp/temp.ts');
const source = fs.readFileSync(filename, 'utf8');
const ast = babylon.parse(source, {
    sourceFilename: filename,
    plugins: ["asyncFunctions", "jsx", "flow"]
});
transformToStateMachine(ast);
let code = generate(ast).code;
console.log(code);
debugger;





function transformToStateMachine(ast: Node) {
    let visitor = plugin(babel).visitor;
    traverse(ast, visitor);
}
