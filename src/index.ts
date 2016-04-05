'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as babylon from "babylon";
import traverse from "babel-traverse";
//import ts = require("typescript");





const filename = path.join(__dirname, '../temp/temp.js');
const source = fs.readFileSync(filename, 'utf8');



const code = `function square(n) {
  return n * n;
}`;

const ast = babylon.parse(source);

traverse(ast, {
  enter(path) {
    if (
      path.node.type === "Identifier" &&
      path.node.name === "n"
    ) {
      path.node.name = "x";
    }
  }
});

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
