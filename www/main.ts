import * as ko from 'knockout';
import * as cm from 'codemirror';
import 'javascript-mode';
import 'z80-mode';
import * as typescript from '../src/slow-script/source-languages/typescript/index';





// Set up a simple viewmodel with 'input' and 'output' properties.
let vm: any = {};
let jasm;
vm.input = ko.observable('').extend({ rateLimit: 500 }),
vm.output = ko.computed(() => {

    // When 'input' changes, recompute the 'output'.
    try {
        jasm = typescript.transpileToJasm(vm.input());
        let jasmStr = jasm.toString();

        // TODO: temp testing... if jasm was successfully created, run it...
        // TODO: maybe trigger this differently / elsewhere
        //setTimeout(run, 20);

        return jasmStr;
    }
    catch (ex) {
        return ex.message;
    }
});
vm.runner = ko.observable('');


// // Run code...
// function run() { // TODO: fix this - step is now async...
//     rEditor.setValue('');
//     log('SCRIPT STARTED');
//     let runner = new Runner(program, {
//         print: msg => log(msg)
//     });

//     while (true) {
//         let result = runner.step();
//         if (result === true) {
//             log('SCRIPT COMPLETED');
//             return;
//         }
//         if (result instanceof Error) {
//             log('SCRIPT FAILED');
//             log(result.message);
//             return;
//         }
//     }
// }


// Remember the value of the 'input' property using local storage.
let store = window.localStorage;
vm.input(store.getItem('input') || '');
vm.input.subscribe(i => store.setItem('input', i));

// Bind the view to the viewmodel.
ko.applyBindings(vm);

// Initialize CodeMirror.
let iEditor = cm.fromTextArea(<any> document.getElementById('input'), {
    mode: 'javascript',
    theme: 'ambiance',
    lineNumbers: true,
    indentUnit: 4,
    indentWithTabs: false
});
iEditor.on('changes', () => {
    vm.input(iEditor.getValue());
});
iEditor.setOption("extraKeys", {
    Tab: function(cm) {
        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces);
    }
});

let oEditor = cm.fromTextArea(<any> document.getElementById('output'), {
    mode: 'z80',
    theme: 'ambiance',
    lineNumbers: true,
    readOnly: true
});
vm.output.subscribe(newValue => oEditor.setValue(newValue));

let rEditor = cm.fromTextArea(<any> document.getElementById('runner'), {
    mode: 'text/plain',
    theme: 'ambiance',
    lineNumbers: true,
    readOnly: true
});

function log(msg) {
    // TODO: fix CM typings to remove three hacks below...
    (<any> rEditor).replaceRange(`${msg}\n`, {line: Infinity});
    rEditor.scrollIntoView({line: (<any> rEditor).lastLine(), ch: void 0});
}                
