declare module "types" {


    import slow = require('slownode');


    export var SlowRoutineFunction: {
        new(bodyFunction: Function, options?: SlowRoutineOptions): SlowRoutineFunction;
        (bodyFunction: Function, options?: SlowRoutineOptions): SlowRoutineFunction;
    };


    interface SlowRoutineOptions {
        yieldIdentifier?: string;
        constIdentifier?: string;
    }


    interface SlowRoutineFunction {
        (...args: any[]): SlowRoutine;
        body: Function;
    }


    interface SlowRoutine {
        next(value?: any): { done: boolean; value: any; };
        throw(value?: any): { done: boolean; value: any; };
        return(value?: any): { done: boolean; value: any; };
        state: any;
    }
}
