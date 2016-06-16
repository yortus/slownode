import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';





// TODO: adapted from: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
export function staticCheck(scriptSource: string, logError: LogError): boolean {

    // TODO: wrap in IIAFE, and account for this in error line numbers...
    scriptSource = `(async () => {\n${scriptSource}\n})()`;

    let libSource = fs.readFileSync(path.join(__dirname, '../../lib.slow.d.ts'), 'utf8');
    let host = createCompilerHost(compilerOptions, scriptSource, libSource);
    let program = ts.createProgram(['script.ts', 'lib.d.ts'], compilerOptions, host);
    let emitResult = program.emit();

    let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    if (allDiagnostics.length > 0) {
        allDiagnostics.forEach(diagnostic => {
            var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            if (diagnostic.file) {
                // NB: lines are 1-based, chars are 0-based
                // NB: take 1 off line to account for IIAFE prolog
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
function createCompilerHost(options: ts.CompilerOptions, scriptSource: string, libSource: string) {
    return <ts.CompilerHost> {
        getSourceFile,
        getDefaultLibFileName: () => "lib.d.ts",
        getDirectories: () => [],
        getCurrentDirectory: () => '',
        getCanonicalFileName: filename => filename,
        getNewLine: () => ts.sys.newLine,
        useCaseSensitiveFileNames: () => false,
        fileExists: () => { throw new Error('Not implemented') },
        readFile: () => { throw new Error('Not implemented') },
        writeFile: () => { throw new Error('Not implemented') },
        resolveModuleNames: () => { throw new Error('Not implemented'); }
    };

    function getSourceFile(filename: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) {
        let sourceText = filename === 'script.ts' ? scriptSource : libSource;
        return sourceText !== undefined ? ts.createSourceFile(filename, sourceText, languageVersion) : undefined;
    }
}
