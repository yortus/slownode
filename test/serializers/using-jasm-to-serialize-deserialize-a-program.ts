// import {JASM} from 'slownode';
// import {expect} from 'chai';





// describe('Using JASM to serialize/deserialize a program', () => {

//     // NB: Note canonical spacing of instruction lines below (see docs)
//     let tests = [
//         ['instruction',                 `    ADD     $0, $1, $2\n`],
//         ['label',                       `L31:\n`],
//         ['blank line',                  `\n`],
//         ['instruction with comment',    `    STRING  $7, "blah"   ; load "blah into register $7\n`],
//         ['label with comment',          `L2:                ;  while (true) {\n`],
//         ['blank line with comment',     `         ; witty remark\n`],
//         ['*invalid* line',              `; no newline here-->`],
//         ['*invalid* instruction 1',     `    $BADOPCODE $0, $1\n`],
//         ['*invalid* instruction 2',     `    ADD $0, $1,\n`],
//         ['*invalid* argument 1',        `    LOAD $8, $1, $0\n`],
//         ['*invalid* argument 2',        `    B -label-\n`],
//         ['*invalid* argument 3',        `    LOAD #33\n`],
//         ['*invalid* label',             `L3.1:\n`],
//         ['program sequence',            `
//                                             ; ===== ENTER SCOPE 1 ===== {  }
//                                         L1:                                             ; while (n < 10) {
//                                             string  $1, "n"
//                                             load    $0, ENV, $1
//                                             undefd  $1
//                                             number  $1, 10
//                                             lt      $0, $0, $1
//                                             undefd  $1
//                                             bf      L2, $0
//                                             undefd  $0
//                                             ; ===== ENTER SCOPE 2 ===== {  }
//                                             string  $0, "print"                         ;     print(n);
//                                             load    $0, ENV, $0
//                                             array   $1
//                                             string  $4, "n"
//                                             load    $2, ENV, $4
//                                             undefd  $4
//                                             number  $3, 0
//                                             store   $1, $3, $2
//                                             null    $2
//                                             call    $0, $0, $2, $1
//                                             undefd  $1
//                                             undefd  $2
//                                             undefd  $3
//                                             undefd  $0
//                                             string  $1, "n"                             ;     n += 1;
//                                             load    $2, ENV, $1                         ; }
//                                             number  $0, 1
//                                             add     $0, $2, $0
//                                             undefd  $2
//                                             store   ENV, $1, $0
//                                             undefd  $1
//                                             undefd  $0
//                                             ; ===== LEAVE SCOPE 2 =====
//                                             b       L1
//         `.split(/[\r\n]+/).slice(1, -1).map(line => line.slice(40)).join('\n') + '\n']
//     ];

//     tests.forEach(test => {
//         let [name, value] = <[string, string]> test;
//         it(name, () => {
//             let expectedError = name.startsWith('*invalid*');
//             let expected = value;
//             let actual: string;
//             let actualError = false;
//             try {
//                 let program = JASM.parse(value);
//                 actual = JASM.stringify(program);
//             }
//             catch (ex) {
//                 actualError = true;
//             }
//             expect(actualError).to.equal(expectedError);
//             expect(!actualError && actual).to.deep.equal(!expectedError && expected);
//         });
//     });
// });
