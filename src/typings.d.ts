///<reference path="../node_modules/@types/babel-core/index.d.ts" />
///<reference path="../node_modules/@types/babel-types/index.d.ts" />
///<reference path="../node_modules/@types/chai/index.d.ts" />
///<reference path="../node_modules/@types/mocha/index.d.ts" />
///<reference path="../node_modules/@types/node/index.d.ts" />





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
