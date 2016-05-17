///<reference path="../typings/babel-core/babel-core.d.ts" />
///<reference path="../typings/babel-generator/babel-generator.d.ts" />
///<reference path="../typings/babel-template/babel-template.d.ts" />
///<reference path="../typings/babel-traverse/babel-traverse.d.ts" />
///<reference path="../typings/babel-types/babel-types.d.ts" />
///<reference path="../typings/babylon/babylon.d.ts" />
///<reference path="../typings/es6-shim/es6-shim.d.ts" />
///<reference path="../typings/node/node.d.ts" />


declare module 'babel' {
    export * from 'babel-core';
}





// TODO: augment nodes with scope info...
declare module 'babel-types' {

    interface Node {
        scope?: {[name: string]: BindingKind};
    }

    type BindingKind = 'var'|'let'|'const'|'hoisted'|'param'|'module';
}
