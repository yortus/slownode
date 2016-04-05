/// <reference path="../babel-types/babel-types.d.ts" />


declare module "babylon" {
    import * as t from 'babel-types';

    export function parse(source: string): t.Node;
}
