




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
