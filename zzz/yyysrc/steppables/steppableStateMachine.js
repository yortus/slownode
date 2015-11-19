//export = SteppableStateMachine;
///**
// * Represents a state machine function, which may be called repeatedly with the same
// * State object to execute an activation of a steppable function through to completion.
// */
//interface SteppableStateMachine {
//    (state: SteppableStateMachine.State): void;
//}
//namespace SteppableStateMachine {
//    /**
//     * Represents the state of all locals at the current point of steppable object execution.
//     * The shape of this interface is an internal implementation detail.
//     */
//    export interface State {
//        pos?: string;
//        local?: { [name: string]: any; };
//        temp?: { [name: string]: any; };
//        ambient?: { [name: string]: any; };
//        error?: {
//            occurred?: boolean;
//            value?: any;
//            handler?: string;
//        };
//        finalizers?: {
//            pending?: string[];
//            afterward?: string;
//        };
//        result?: any;
//        incoming?: { type?: string; /* 'yield'|'throw'|'return' */ value?: any; };
//        outgoing?: { type?: string; /* 'yield'|'throw'|'return' */ value?: any; };
//    }
//}
//# sourceMappingURL=steppableStateMachine.js.map