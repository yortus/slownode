'use strict';





const MAX_REGISTERS = 8;





export class Register {


    constructor(name?: string) {
        this.name = name || 'Unnamed Register';
    }


    name: string;


    value: any;


    // TODO: was... remove...
    // toString() {
    //     return this.name;
    // }
}





// TODO: was... remove...
// export class RegisterFile {


//     VOID = new Register('VOID');


//     /** Issues a general purpose register from the pool. */
//     reserve(): Register {
//         let reg: Register = null;

//         for (let i = 0; i < this.generalPurpose.length; ++i) {
//             reg = this.generalPurpose[i];
//             if (!reg) continue;
//             this.generalPurpose[i] = null;
//             return reg;
//         }

//         if (this.generalPurpose.length < MAX_REGISTERS) {
//             reg = new Register(`$${this.generalPurpose.length}`);
//             this.generalPurpose.push(null);
//             return reg;
//         }

//         throw new Error(`All registers in use.`);
//     }


//     /** Returns the given general purpose register to the pool. */
//     release(reg: Register) {
//         let i = +reg.name.slice(1);
//         this.generalPurpose[i] = reg;
//     }


//     public releaseAll(...regs: any[]) {
//         regs.forEach(reg => {
//             if (reg instanceof Register) {
//                 this.release(reg);
//             }
//         });
//     }

    
//     private generalPurpose: Register[] = [];
// }
