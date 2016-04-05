'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as babylon from "babylon";
import * as t from "babel-types";
import traverse, {Visitor} from "babel-traverse";
import generate from "babel-generator";
//import ts = require("typescript");





const filename = path.join(__dirname, '../temp/temp.js');
const source = fs.readFileSync(filename, 'utf8');



const code = `function square(n) {
  return n * n;
}`;

const ast = babylon.parse(code);

traverse(ast, {

    enter({node}) {
        if (t.isIdentifier(node)) {
            if (node.name === "n") {
                node.name = "x";
            }
        }
    },

    Identifier: {
        enter({node}) {
            if (t.isIdentifier(node)) {
                if (node.name === "n") {
                    node.name = "x";
                }
            }
        }
    }
});

debugger;

var out = generate(ast, null, code);


debugger;

// let ast = esprima.parse(source, {});
// debugger;

// let target = escodegen.generate(ast, {});
// debugger;




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





const updateParamNameVisitor: Visitor = {
  Identifier(path) {
    if (path.node.name === this.paramName) {
      path.node.name = "x";
    }
  }
};

const MyVisitor: Visitor = {
  FunctionDeclaration(path) {
    const param = path.node.params[0];
    const paramName = param.name;
    param.name = "x";

    path.traverse(updateParamNameVisitor, { paramName });
  }
};
