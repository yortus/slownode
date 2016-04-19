'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as babylon from "babylon";
import * as t from "babel-types";
import {Node} from "babel-types";
import traverse, {Visitor} from "babel-traverse";
import generate from "babel-generator";
import template = require("babel-template");
import * as babel from 'babel-core';
import run from './interpreter';
//import ts = require("typescript");





const filename = path.join(__dirname, '../temp/temp.js');
const source = fs.readFileSync(filename, 'utf8');
const ast = babylon.parse(source, {plugins: ["jsx", "flow"]});
run(ast);




















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
