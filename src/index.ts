'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';





const filename = path.join(__dirname, '../temp/temp.js');
const source = fs.readFileSync(filename, 'utf8');


let ast = esprima.parse(source, {});
debugger;

let target = escodegen.generate(ast, {});
debugger;


