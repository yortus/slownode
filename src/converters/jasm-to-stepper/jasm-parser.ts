import * as fs from 'fs';
import * as path from 'path';
import * as PEG from 'pegjs';
import Jasm from '../../types/jasm';





// TODO: doc, remove/improve try/catch
export function parse(jasm: Jasm): JasmAst {
    try {
        let jasmAst = pegParser.parse(jasm.toString());
        return jasmAst;
    }
    catch (ex) {
        debugger;
        ex;

    }
}





// TODO: doc...
export interface JasmAst {
    code: Array<BlankLine | LabelLine | InstructionLine>;
    data: string;
}





// TODO: doc...
export interface BlankLine {
    type: 'blank';
    comment?: string;
}





// TODO: doc...
export interface LabelLine {
    type: 'label';
    name: string;
    comment?: string;
}





// TODO: doc...
export interface InstructionLine {
    type: 'instruction';
    opcode: string;
    arguments: Array<{type: 'register', name: string} | {type: 'label', name: string} | {type: 'const', value: any}>;
    comment?: string;
}





// TODO: ...
const pegParser = PEG.buildParser(`
{
	function blank(comment) {
    	let line = {type: 'blank'};
        if (comment) line.comment = comment;
        return line;
    }
	function label(name, comment) {
    	let line = {type: 'label', name};
        if (comment) line.comment = comment;
        return line;
    }
	function instr(opcode, args, comment) {
    	let line = {type: 'instruction', opcode, arguments: args || []};
        if (comment) line.comment = comment;
        return line;
    }
}





//========================= START RULE ==============================
File                  =   BlankLine*   code:CodeSection   data:DataSection   EOF   { return {code, data}; }





//========================= CODE SECTION ==============================
CodeSection           =   ".CODE"   SPC?   Comment?   EOL   lines:CodeLine*   { return lines; }
CodeLine              =   BlankLine   /   LabelLine   /   InstructionLine

// ---------- blank line ----------
BlankLine             =   SPC?   c:Comment?   EOL   { return blank(c); }

// ---------- label line ----------
LabelLine             =   SPC?   name:LabelName   ":"   SPC?   c:Comment?   EOL   { return label(name, c); }
LabelName             =   [a-z]i    [a-z0-9]i*   { return text(); }

// ---------- instruction line ----------
InstructionLine       =   SPC?   o:OpCode   SPC?   a:ArgumentList?   SPC?   c:Comment?   EOL   { return instr(o, a, c); }
OpCode "opcode"       =   [a-z]i+   { return text(); }
ArgumentList          =   first:Argument   rest:NextArgument*   { return [first].concat(rest); }
NextArgument          =   SPC?   ","   SPC?   arg:Argument   { return arg; }
Argument              =   RegisterArgument   /   LabelArgument   /   StringArgument   /   NumberArgument
RegisterArgument      =   ("ENV"   /   "PC"   /   ("$" [0-7]))   { return {type: 'register', name: text()}; }
LabelArgument "label" =   [a-z]i   [a-z0-9]i   { return {type: 'label', name: text()}; }
StringArgument        =   String   { return {type:'const', value: JSON.parse(text())}; }
NumberArgument        =   Number   { return {type:'const', value: JSON.parse(text())}; }

// ---------- comment ----------
Comment "comment"     =   ";"   (!EOL .)*   { return text().slice(1); }





//========================= DATA SECTION ==============================
DataSection           =   ".DATA"   SPC?   Comment?   EOL   json:Json   { return json; }
Json                  =   WS?   Value   WS?   { return text(); }
Value                 =   NULL   /   TRUE   /   FALSE   /   String   /   Number   /   Object   /   Array

// ---------- string literal ----------
String "string"       =   '"'   Character*   '"'
Character             =   [^\\0-\\x1F\\x22\\x5C]   // NB: double escaped!
                      /   BSLASH   BSLASH
                      /   BSLASH   ["/bfnrt]
                      /   BSLASH   "u"   HEXDIGIT   HEXDIGIT   HEXDIGIT   HEXDIGIT

// ---------- number literal ----------
Number "number"       =   "-"?   IntegerPart   FractionPart?   ExponentPart?
IntegerPart           =   "0"   /   [1-9]   DIGIT*
FractionPart          =   "."   DIGIT+
ExponentPart          =   [eE]   ("+" / "-")?   DIGIT+

// ---------- object literal ----------
Object                =   "{"   WS?   ObjectProperties?   WS?   "}"
ObjectProperties      =   ObjectProperty   (WS?   ","   WS?   ObjectProperty)*
ObjectProperty        =   String   WS?   ":"   WS?   Value

// ---------- array literal ----------
Array                 =   "["   WS?   ArrayElements?   WS?   "]"
ArrayElements         =   Value   (WS?   ","   WS?   Value)*





//========================= TERMINALS ==============================
BSLASH                = "\\\\" // NB: template string will unescape this to "\\", pegjs will unescape that to "\"
DIGIT                 = [0-9]
EOF "end of file"     = !.
EOL "end of line"     = "\\r\\n"   /   "\\r"   /   "\\n"
FALSE                 = "false"
HEXDIGIT              = [0-9a-f]i
NULL                  = "null"
SPC "space"           = [ \\t]+
TRUE                  = "true"
WS "whitespace"       = (SPC / EOL)+
`);