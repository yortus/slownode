'use strict';





export let globals = {
    
    '%enterScope%': 0,
    '%leaveScope%': 0,

    '%constructArray%': 0,
    '%constructRegExp%': 0,

    '%operator%': 0,
    '%operator+%': 0,
    '%operator-%': 0,
    '%operator*%': 0,
    '%operator/%': 0,

}




export class VM {
    call() {}
    callIndirect() {}
    get() {}
    getProp() {}
    jump() {}
    jumpIfTruthy() {}
    jumpIfFalsy() {}
    label() {}
    pop() {}
    push() {}
    set() {}
    setProp() {}
}
