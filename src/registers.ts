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
    reserve(): Register {
        let reg: Register = null;

        for (let i = 0; i < this.generalPurpose.length; ++i) {
            reg = this.generalPurpose[i];
            if (!reg) continue;
            this.generalPurpose[i] = null;
            return reg;
        }

        if (this.generalPurpose.length < MAX_REGISTERS) {
            reg = new Register(`R${this.generalPurpose.length}`);
            this.generalPurpose.push(null);
            return reg;
        }

        throw new Error(`All registers in use.`);
    }


    /** Returns the given general purpose register to the pool. */
    release(reg: Register) {
        let i = +reg.name.slice(1);
        this.generalPurpose[i] = reg;
    }


    public releaseAll(...regs: any[]) {
        regs.forEach(reg => {
            if (reg instanceof Register) {
                this.release(reg);
            }
        });
    }

    
    private generalPurpose: Register[] = [];
}
