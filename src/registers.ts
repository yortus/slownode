'use strict';
import Address from './address';





const FILE_SIZE = 64;





export class Register {
    constructor(public name: string) { }
    toString() { return this.name; }
}





export class RegisterFile {


    constructor() {
        this.generalPurpose = new Array(FILE_SIZE);
        for (let i = 0; i < FILE_SIZE; ++i) {
            this.generalPurpose[i] = new Register(`R${i}`);
        }
    }


    VOID = new Register('VOID');


    /** Issues a general purpose register from the pool. */
    reserve(callback: (...regs: Register[]) => void): void {
        let count = callback.length;
        let args: Register[] = [];
        try {
            for (let i = 0; i < FILE_SIZE; ++i) {
                let reg = this.generalPurpose[i];
                if (!reg) continue;
                this.generalPurpose[i] = null;
                args.push(reg);
                if (args.length === count) return callback(...args);
            }
            throw new Error(`All registers in use.`);
        }
        finally {
            args.forEach(reg => this.release(reg));
        }
    }


    /** Returns the given general purpose register to the pool. */
    private release(reg: Register) {
        let i = +reg.name.slice(1);
        this.generalPurpose[i] = reg;
    }


    private generalPurpose: Register[];
}
