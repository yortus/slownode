import * as fs from 'fs';
import * as path from 'path';
import * as PEG from 'pegjs';
import Program from './program';





// TODO: doc...
export default function parse(text: string): Program {
    let result = pegParser.parse(text);
    return result;
}





// TODO: ...
const pegParser = PEG.buildParser(`
// ---------- helper functions ----------
{
    let blank = (comment) => withComment({type: 'blank'}, comment);
    let label = (name, comment) => withComment({type: 'label', name}, comment);
    let instr = (opcode, args, comment) => withComment({type: 'instruction', opcode, arguments: args || []}, comment);
    function withComment(line, comment) {
        comment = comment || {};
        if (comment.text !== void 0) line.comment = comment.text;
        if (comment.col !== void 0) line.commentColumn = comment.col;
        return line;
    }
}

// ---------- start rule ----------
Start                 =   lines:CodeLine*   EOF   { return {lines}; }
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
RegisterArgument      =   ("PC"   /   "ENV"   /   "ERR"   /   ("$" [0-7]))   { return {type: 'register', name: text()}; }
LabelArgument "label" =   [a-z]i   [a-z0-9]i*   { return {type: 'label', name: text()}; }
StringArgument        =   String   { return {type:'const', value: JSON.parse('"' + text().slice(1, -1) + '"')}; }
NumberArgument        =   Number   { return {type:'const', value: JSON.parse(text())}; }

// ---------- comment ----------
Comment "comment"     =   ";"   (!EOL .)*   { return { text: text().slice(1), col: location().start.column - 1 }; }

// ---------- string literal ----------
String "string"       =   "'"   Character*   "'"
Character             =   [^\\0-\\x1F\\x27\\x5C]   // NB: double escaped!
                      /   BSLASH   BSLASH
                      /   BSLASH   ['/bfnrt]
                      /   BSLASH   "u"   HEXDIGIT   HEXDIGIT   HEXDIGIT   HEXDIGIT

// ---------- number literal ----------
Number "number"       =   "-"?   IntegerPart   FractionPart?   ExponentPart?
IntegerPart           =   "0"   /   [1-9]   DIGIT*
FractionPart          =   "."   DIGIT+
ExponentPart          =   [eE]   ("+" / "-")?   DIGIT+

// ---------- terminals ----------
BSLASH                = "\\\\" // NB: template string will unescape this to "\\", pegjs will unescape that to "\"
DIGIT                 = [0-9]
EOF "end of file"     = !.
EOL "end of line"     = "\\r\\n"   /   "\\r"   /   "\\n"
HEXDIGIT              = [0-9a-f]i
SPC "space"           = [ \\t]+
`);
