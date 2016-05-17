'use strict';
import Task from './task';
import VirtualMachine, {Register} from './virtual-machine';





// TODO: ...
export default class TaskRunner {


    // TODO: ...
    constructor(task: Task) {
        let vm = this.vm = makeVM();
        let code = this.code = recompile(task.code, vm);
    }


    // TODO: ...
    step() {
        while (true) { // TODO: this loop doesn't belong here...
            try {
                this.code();
                ++this.vm.PC.value;
            }
            catch (ex) {
                if (ex instanceof Branch) {
                    debugger;
                }
                else if (ex instanceof Finish) {
                    debugger;
                    return;
                }
            }
        }
    }


    // TODO: ...
    private vm: VirtualMachine;
    private code: () => void;
}





function recompile(code: () => void, vm: VirtualMachine) {
    let makeCode = new Function('code', 'vm', `with (vm) return (${code})`);
    let result: () => void = makeCode(code, vm);
    return result;
}





// TODO: ...
function makeVM() {

    let vm: VirtualMachine = {
        LOAD:   (tgt, obj, key) => tgt.value = obj.value[key instanceof Register ? key.value : key],
        LOADC:  (tgt, val) => tgt.value = val,
        STORE:  (obj, key, src) => obj.value[key instanceof Register ? key.value : key] = src.value,
        MOVE:   (tgt, src) => tgt.value = src.value,

        ADD:    (tgt, lhs, rhs) => tgt.value = lhs.value + rhs.value,
        SUB:    (tgt, lhs, rhs) => tgt.value = lhs.value - rhs.value,
        MUL:    (tgt, lhs, rhs) => tgt.value = lhs.value * rhs.value,
        DIV:    (tgt, lhs, rhs) => tgt.value = lhs.value / rhs.value,
        NEG:    (tgt, arg) => tgt.value = -arg.value,
        NOT:    (tgt, arg) => tgt.value = !arg.value,

        EQ:     (tgt, lhs, rhs) => tgt.value = lhs.value === rhs.value,
        GE:     (tgt, lhs, rhs) => tgt.value = lhs.value >= rhs.value,
        GT:     (tgt, lhs, rhs) => tgt.value = lhs.value > rhs.value,
        LE:     (tgt, lhs, rhs) => tgt.value = lhs.value <= rhs.value,
        LT:     (tgt, lhs, rhs) => tgt.value = lhs.value < rhs.value,
        NE:     (tgt, lhs, rhs) => tgt.value = lhs.value !== rhs.value,

        B:      (line) => jump(line),
        BF:     (line, arg) => arg.value ? null : jump(line),
        BT:     (line, arg) => arg.value ? jump(line) : null,
        CALL:   (tgt, func, thís, args) => tgt.value = func.value.apply(thís.value, args.value),
        QUIT:   () => { throw new Finish(); },

        NEWARR: (tgt) => tgt.value = [],
        NEWOBJ: (tgt) => tgt.value = {},

        PC:     new Register('PC', 0),
        ENV:    new Register('ENV'),
        $0:     new Register('$0'),
        $1:     new Register('$1'),
        $2:     new Register('$2'),
        $3:     new Register('$3'),
        $4:     new Register('$4'),
        $5:     new Register('$5'),
        $6:     new Register('$6'),
        $7:     new Register('$7')
    };

    function jump(line: number) {
        // TODO: scope enter/exit, finally blocks
        vm.PC.value = line;
        throw new Branch();
    }

    vm.ENV.value = {};
    return vm;
}





// TODO: ...
class Branch extends Error { }
class Finish extends Error { }
