// Ambients still need triple-slash references... See https://github.com/Microsoft/TypeScript/issues/9208
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
