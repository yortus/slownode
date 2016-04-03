/// <reference path="../estree/estree.d.ts" />

declare module 'escodegen' {
    interface GenerateOpts {
        comment?: boolean;
        format?: {
            indent?: {
                style?: string;
                base?: number;
                adjustMultilineComment: boolean;
            }
        }
    }

    export function generate(ast: ESTree.Node, opts?: GenerateOpts): string;
}
