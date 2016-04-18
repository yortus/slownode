'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as babylon from "babylon";
import * as t from "babel-types";
import traverse, {Visitor} from "babel-traverse";
import generate from "babel-generator";
import template = require("babel-template");
import * as babel from 'babel-core';
//import ts = require("typescript");



export default function myPlugin({types: t}: typeof babel) {
    return {
        visitor: <babel.Visitor> {
            UnaryExpression: {
                enter(path) {}
            },
            BinaryExpression(path, state) {
                path
                state.opts
                if (t.isIdentifier(path)) {
                    path.node.left
                    t.isReferencedIdentifier(path)


                    let n = t.memberExpression(
                        t.identifier('object'),
                        t.identifier('property')
                    );
                    
                    path.replaceWith(n);
                    path.get
                }
            }
        }
    }    
}


const filename = path.join(__dirname, '../temp/temp.js');
const source = fs.readFileSync(filename, 'utf8');





var b = babel.transform('var x = 5;', {
    retainLines: true,
    ast: false
});
    


const code = `/*sdfsdsdf*/ function square(n: string) {
    // do stuff
  return n * n;
}`;

const ast = babylon.parse(code, {plugins: ["jsx", "flow"]});






const buildRequire = template(`
  var IMPORT_NAME = require(SOURCE);
`);


const ast2 = buildRequire({
  SOURCE: t.stringLiteral("my-module"),
  IMPORT_NAME: t.identifier("myModule")
});

debugger;

var code2 = generate(ast2).code;

debugger;























var tests = [
    // t.arrayExpression(),

    // t.unionTypeAnnotation(
    //     [
    //         t.voidTypeAnnotation(),
    //         t.stringLiteralTypeAnnotation()
    //     ]
    // ),


    
    t.jSXElement(
        t.jSXOpeningElement(
            t.jSXIdentifier('h1'), []
        ),
        void 0,
        []
    )
    
];


var fd = t.functionDeclaration(
    t.identifier("foo"),
    [],
    t.blockStatement([], [])
);


traverse(ast, {

    enter({node}) {
        if (t.isIdentifier(node)) {
            if (node.name === "n") {
                node.name = "x";
            }
        }
    },

    Flow({node}) {
        debugger;
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

// const MyVisitor: Visitor = {
//   FunctionDeclaration(path) {
//     const param = path.node.params[0];
//     const paramName = param.name;
//     param.name = "x";

//     path.traverse(updateParamNameVisitor, { paramName });
//   }
// };
