/// <reference path="babel-types.d.ts" />


declare module "babylon" {

    export function parse(source: string): AnyNode;
}
