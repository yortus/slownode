import Epoch from './epoch';





// TODO: temp testing...
export {Epoch};
export default new Epoch();





// TODO: temp testing...
let script = `.CODE
L1:
    load $0, ENV, $1
    blah
    blah
L2: ; comment
    noop
    b L1
    add $0, $0, $1
    stop             ; end
    ; nothing else
.DATA
"some\\nJSON\\nstring..."
`;

script = script.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

//TODO: was...
let re = /^[\s\S]*?\.CODE\n([\s\S]+?)\n\.DATA\n([\s\S]+)$/;


debugger;
let matches = script.match(re);
debugger;
