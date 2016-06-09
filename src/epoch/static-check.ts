'use strict';
import * as ts from 'typescript';





// TODO: adapted from: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
export function staticCheck(scriptSource: string, logError: LogError): boolean {

    // TODO: wrap in IIAFE, and account for this in error line numbers...
    scriptSource = `(async () => {\n${scriptSource}\n})()`;

    // TODO: move this slow.lib.d.ts into its own file...
    let libSource = `
        interface Array<T> {}
        interface Boolean {}
        interface Function {}
        interface IArguments {}
        interface Number {}
        interface Object {}
        interface RegExp {}
        interface String {}
        interface Promise<T> {}

        declare function print(message: string);
        declare function sleep(ms: number): Promise<void>;
        declare function sleepThenFail(ms: number, message: string): Promise<void>;
    `;
    let host = createCompilerHost(compilerOptions, scriptSource, libSource);
    let program = ts.createProgram(['script.ts', 'lib.d.ts'], compilerOptions, host);
    let emitResult = program.emit();

    let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    if (allDiagnostics.length > 0) {
        allDiagnostics.forEach(diagnostic => {
            var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            if (diagnostic.file) {
                // NB: lines are 1-based, chars are 0-based
                var { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                logError(message, line - 1, character + 1);
            }
            else {
                logError(message, 0, 0);
            }
        });
    }

    return allDiagnostics.length === 0;
}





// TODO: ...
// TODO: also log end line/col? ie to get a range
export type LogError = (message: string, line: number, column: number) => void;





// TODO: ...
const compilerOptions = <ts.CompilerOptions> {
    target: ts.ScriptTarget.ES6,
    module: ts.ModuleKind.None,
    noEmit: true
};





// TODO: ...
function createCompilerHost(options: ts.CompilerOptions, scriptSource: string, libSource: string): ts.CompilerHost {
    return {
        getSourceFile,
        getDefaultLibFileName: () => "lib.d.ts",
        writeFile: () => { throw new Error('Not implemented') },
        getCurrentDirectory: () => '',
        getCanonicalFileName: filename => filename,
        getNewLine: () => ts.sys.newLine,
        useCaseSensitiveFileNames: () => false,
        fileExists,
        readFile,
        resolveModuleNames: () => { throw new Error('Not implemented'); }
    }

    function getSourceFile(filename: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) {
        let sourceText: string;
        if (filename === 'script.ts') {
            sourceText = scriptSource;
        }
        else if (filename === 'lib.d.ts') {
            sourceText = libSource;
        }
        return sourceText !== undefined ? ts.createSourceFile(filename, sourceText, languageVersion) : undefined;
    }

    function fileExists(filename: string): boolean {
        throw new Error('Not implemented');
        // return filename === 'script.ts' || filename === 'lib.d.ts'
    }

    function readFile(filename: string): string {
        throw new Error('Not implemented');
        // if (filename === 'script.ts') return scriptSource;
        // if (filename === 'lib.d.ts') return libSource;
    }
}
