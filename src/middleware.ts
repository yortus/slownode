




// TODO: temp testing...
declare module 'slownode/middleware' {


    // TODO: ...
    export interface MiddlewareOptions {
        [id: string]: any; // TODO: ...
    }


    // TODO: ...
    export interface Middleware {
        (api: MiddlewareAPI, options: any): void;
    }


    // TODO: ...
    export interface MiddlewareAPI {

        // TODO: ... return promise?
        createGlobalObject(): {};

        // TODO: ... return promise?
        createInterpreter(script: string, global: {}): Interpreter;
    }


    // TODO: ...
    export interface Interpreter {
        step: () => Promise<boolean>;
        throwInto(err: any): void; // TODO: needs return val? See comments in jasm/interpreter.ts
        registers: RegisterSet & {[name: string]: Register};
    }


    // TODO: ...
    export class Register {
        name: string;
        value: any;
    }


    // TODO: ...
    export interface RegisterSet {
        PC:     Register;
        ENV:    Register;
        $0:     Register;
        $1:     Register;
        $2:     Register;
        $3:     Register;
        $4:     Register;
        $5:     Register;
        $6:     Register;
        $7:     Register;
    }
}
