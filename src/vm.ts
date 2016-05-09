'use strict';





export let globals = {

    '%constructArray%': 0,
    '%constructRegExp%': 0,

    '%operator%': 0,
    '%operator+%': 0,
    '%operator-%': 0,
    '%operator*%': 0,
    '%operator/%': 0,

}




export function makeVM() {

    let evalStack = [];
    let env = {};

    let opcodes = {
        call:   (arglen: number) => {},
        calli0: (name: string) => {},
        calli1: (name: string) => {},
        calli2: (name: string) => {},
        get:    () => {},
        getin:  () => {},
        br:     (line: number) => {},
        bf:     (line: number) => {},
        bt:     (line: number) => {},
        pop:    () => { evalStack.pop(); },
        push:   (val: string | number | boolean) => { evalStack.push(val); },
        roll:   (count: number) => {},
        set:    () => {},
        setin:  () => {},
    };

    // TODO: add prolog and epilog to every opcode
    let vm: (typeof opcodes) & { pc: number } = <any> {};
    vm.pc = 0;
    Object.keys(opcodes).forEach(opcode => {
        let oldImpl = opcodes[opcode];
        let newImpl = (...args) => {

            // PROLOG
            console.log(opcode);

            // IMPL
            let result = oldImpl(...args);

            // EPILOG
            ++vm.pc; // not if branch!
        };
        vm[opcode] = newImpl;
    });





    return vm;
}
