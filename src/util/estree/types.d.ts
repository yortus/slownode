

// Augment ESTree.FunctionExpression with cached identifier metadata.
declare module ESTree {
    export interface Function {
        _ids: ClassifiedIdentifiers;
    }
}


/** All identifiers referenced in a function body, grouped into categories. */
interface ClassifiedIdentifiers {

    /** Identifiers which are declared locally inside the function body. */
    local: {

        /** Identifier of the function being executed, if any. */
        self: string[];

        /** Identifiers declared with the 'var' keyword. */
        var: string[];

        /** Identifiers declared with the 'let' keyword. */
        let: string[];

        /** Identifiers declared with the 'const' keyword. */
        const: string[];

        /** Identifiers declared as the exception IDs in catch block headers. */
        catch: string[];

        /** All var, let, const and catch local identifiers in a single list. */
        all: string[];
    };

    /** Closed-over identifiers defined at the module level (eg require, __filename, __dirname, etc). */
    module: string[];

    /** Closed-over identifiers that are *NOT* declared at the local, global, or module levels. */
    scoped: string[];

    /** Closed-over identifiers that are properties of the 'global' object. */
    global: string[];
}
