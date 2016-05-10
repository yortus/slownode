'use strict';
import Address from './address';





const MAX_REGISTERS = 64;





export class Register {
    constructor(public name: string) { }
    toString() { return this.name; }
}





export class RegisterFile {


    VOID = new Register('VOID');


    /** Issues a general purpose register from the pool. */
    reserve(callback: (...regs: Register[]) => void): void {
        let count = callback.length;
        let args: Register[] = [];
        try {
            for (let i = 0; args.length < count && i < this.generalPurpose.length; ++i) {
                let reg = this.generalPurpose[i];
                if (!reg) continue;
                this.generalPurpose[i] = null;
                args.push(reg);
            }

            while (args.length < count && this.generalPurpose.length < MAX_REGISTERS) {
                let reg = new Register(`R${this.generalPurpose.length}`);
                this.generalPurpose.push(null);
                args.push(reg);
            }

            if (args.length === count) return callback(...args);
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


    private generalPurpose: Register[] = [];
}
