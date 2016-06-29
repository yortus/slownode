import InstructionSet from '../../types/instruction-set';
import {Program} from '../../formats/jasm';
import RegisterSet from '../../types/register-set';





// TODO: ...
export default function makeNextFunction(program: Program, virtualMachine: InstructionSet & RegisterSet): () => IteratorResult<Promise<void>> {

    // TODO: Associate each label with it's zero-based line number...
    let labels = program.lines.reduce((labels, line, i) => {
        if (line.type === 'label') labels[line.name] = i;
        return labels;
    }, {});

    let prolog = [
        `function next() {`,
        `    let done = false, p = void 0;`,
        `    switch (_.PC.value++) {`,
    ];

    // TODO: ...
    let cases = program.lines.map((line, i) => {
        switch (line.type) {
            case 'blank':
            case 'label':
                return '';
            case 'instruction':
                let opcode = line.opcode.toUpperCase();
                if (opcode === 'STOP') return `done = true; _.PC.value = ${i}; `;
                return `p = _.${opcode}(${line.arguments.map(arg => {
                    switch (arg.type) {
                        case 'register':    return `_.${arg.name}`;
                        case 'label':       return labels[arg.name];
                        case 'const':       return JSON.stringify(arg.value);
                        default:            throw new Error(`Unhandled JASM argument type`); /* sanity check only */
                    }
                }).join(', ')}); `;
            default:
                throw new Error(`Unhandled JASM line type`); /* sanity check only */
        }
    }).map((line, i) => `        case ${`${i}:    `.slice(0, 6)} ${line}break;`);

    let epilog = [
        `    }`,
        `    return { done, value: done ? void 0 : Promise.resolve(p) };`,
        `}`
    ];

    // TODO: Eval up the step() function...
    // TODO: what if an THROW/AWAIT op rejects? It's not handled properly in the current VM code...
    let _ = virtualMachine;
    let source = [].concat(prolog, cases, epilog).join('\n');
    let result: () => IteratorResult<Promise<void>> = eval(`(${source})`);


    // TODO: temp testing... remove...
    console.log(result.toString())
    return result;
}
