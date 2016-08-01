// import Program from '../../script/program';





// // TODO: doc...
// export default function stringify(program: Program): string {

//     // TODO: ...
//     let lines = program.lines.map(line => {

//         // TODO: ...
//         let s: string;
//         switch (line.type) {
//             case 'blank':
//                 s = '';
//                 break;

//             case 'label':
//                 s = `${line.name}:`;
//                 break;

//             case 'instruction':
//                 let args = line.arguments.map(arg => {
//                     switch (arg.type) {
//                         case 'register':    return arg.name;
//                         case 'label':       return arg.name;
//                         case 'const':       return "'" + JSON.stringify(arg.value).replace(/'/g, "\\'").slice(1, -1) + "'";
//                         default:            throw new Error(`Unhandled JASM argument type`);
//                     }
//                 });
//                 s = `    ${line.opcode} ${' '.repeat(Math.max(0, 7 - line.opcode.length))}${args.join(', ')}`;
//                 break;

//             default:
//                 // NB: Runtime exhaustiveness check. We can only get here if lines types were added to other code but not here.
//                 throw new Error(`Unhandled JASM line type`);
//         }

//         // TODO: ...
//         if (line.comment) {
//             if (line.commentColumn) s = s + ' '.repeat(Math.max(0, line.commentColumn - s.length));
//             s = `${s};${line.comment}`;
//         }

//         return s;
//     });

//     // TODO: ...
//     return `${lines.join('\n')}\n`;
// }
