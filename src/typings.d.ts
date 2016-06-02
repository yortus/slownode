///<reference path="../typings/babel-core/babel-core.d.ts" />
///<reference path="../typings/babel-types/babel-types.d.ts" />
///<reference path="../typings/node/node.d.ts" />





declare module 'babel-standalone' {
    export * from 'babel-core';
}





// TODO: augment nodes with scope info...
declare module 'babel-types' {

    interface Node {
        scope?: {[name: string]: BindingKind};
    }

    type BindingKind = 'var'|'let'|'const'|'hoisted'|'param'|'module';
}
