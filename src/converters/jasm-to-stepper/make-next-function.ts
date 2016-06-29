import InstructionSet from '../../types/instruction-set';
import {Program} from '../../formats/jasm';
import RegisterSet from '../../types/register-set';





// TODO: ...
export default function makeNextFunction(program: Program, virtualMachine: InstructionSet & RegisterSet): () => IteratorResult<Promise<void>> {

    // TODO: Associate each label with it's one-based line number...
    let labels = program.lines.reduce((labels, line, i) => {
        if (line.type === 'label') labels[line.name] = i + 1;
        return labels;
    }, {});

    // TODO: ...
    let codeLines = program.lines.map(line => {
        switch (line.type) {
            case 'blank':
                return `// ${line.comment}`;
            case 'label':
                return `// ${line.name}:`;
            case 'instruction':
                return `${line.opcode.toUpperCase()}(${line.arguments.map(arg => {
                    switch (arg.type) {
                        case 'register':
                            return arg.name;
                        case 'label':
                            return labels[arg.name];
                        case 'const':
                            return JSON.stringify(arg.value);
                        default:
                            // NB: Runtime exhaustiveness check. We can only get here if argument types were added to other code but not here.
                            throw new Error(`Unhandled JASM instruction argument type`);
                    }
                })})`;
            default:
                // NB: Runtime exhaustiveness check. We can only get here if lines types were added to other code but not here.
                throw new Error(`Unhandled JASM code line type`);
        }
    });

    // TODO: re-format lines as switch cases...
    let lines: string[] = [];
    let prevIsCommentLine = false;
    codeLines.forEach((line, i) => {
        let isCommentLine = line.startsWith('//');
        let result = '';
        if (isCommentLine) {
            if (!prevIsCommentLine) lines.push('');
            result += `            ${line}`;
        }
        else {
            result += `case ${`${i+1}:    `.slice(0, 6)} p = ${line};`;
            result += ' '.repeat(Math.max(0, 74 - result.length)) + 'break;';
        }
        lines.push(result);
        prevIsCommentLine = isCommentLine;
    });

    // TODO: Eval up the step() function...
    // TODO: what if an THROW/AWAIT op rejects? It's not handled properly in the current VM code...
    let makeCode = new Function('vm', `
        with (vm) return (() => {
            let p;
            switch (PC.value++) {
                ${lines.map(line => `${' '.repeat(16)}${line}`).join('\n').slice(16)}
            }
            let done = PC.value > ${codeLines.length}; // If done, must have seen STOP instruction
            let result = { done, value: done ? void 0 : Promise.resolve(p) };
            return result;
        })`);
    let result: () => IteratorResult<Promise<void>> = makeCode(virtualMachine);

    // TODO: temp testing... remove...
    console.log(result.toString())
    return result;
}
