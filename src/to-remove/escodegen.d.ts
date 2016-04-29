/// <reference path="./estree.d.ts" />


declare module 'escodegen' {

    export function generate(ast: ESTree.Node, options?: any): string;

}
