import * as PEG from 'pegjs';
import JASM from '../jasm';





export function replacer(key, val) {
    if (!(val instanceof JASM)) return val;

    // TODO: ...
    let jasm: JASM = val;
    let lines = jasm.lines.map(line => {

        // TODO: ...
        let s: string;
        switch (line.type) {
            case 'blank':
                s = '';
                break;

            case 'label':
                s = `${line.name}:`;
                break;

            case 'instruction':
                let args = line.arguments.map(arg => {
                    switch (arg.type) {
                        case 'register':    return arg.name;
                        case 'label':       return arg.name;
                        case 'const':       return lit(arg.value);
                        default:            throw new Error(`Unhandled JASM argument type`);
                    }
                });
                s = `    ${line.opcode} ${' '.repeat(Math.max(0, 7 - line.opcode.length))}${args.join(', ')}`;
                break;

            default:
                // NB: Runtime exhaustiveness check. We can only get here if lines types were added to other code but not here.
                throw new Error(`Unhandled JASM line type`);
        }

        // TODO: ...
        if (line.comment) {
            if (line.commentColumn) s = s + ' '.repeat(Math.max(0, line.commentColumn - s.length));
            s = `${s};${line.comment}`;
        }

        return s;
    });

    // TODO: ...
    return {$: 'JASM', lines};
}





export function reviver(key, val) {
    if (!val || val.$ !== 'JASM') return val;

    let lines = pegParser.parse(val.lines.join('\n') + '\n');
    let result = new JASM(lines);
    return result;
}





// TODO: this is copypasta from jasm-emitter.ts...
function lit(v: string | number) {
    let result = JSON.stringify(v);
    if (typeof v === 'string') {
        result = "'" + result.replace(/'/g, "\\'").slice(1, -1) + "'";
    }
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
Start                 =   lines:CodeLine*   EOF   { return lines; }
CodeLine              =   BlankLine   /   LabelLine   /   InstructionLine

// ---------- blank line ----------
BlankLine             =   SPC?   c:Comment?   EOL   { return blank(c); }

// ---------- label line ----------
LabelLine             =   SPC?   name:LabelName   ":"   SPC?   c:Comment?   EOL   { return label(name, c); }
LabelName             =   [a-z]i    [a-z0-9]i*   { return text(); }

// ---------- instruction line ----------
InstructionLine       =   SPC?   o:Opcode   SPC?   a:ArgumentList?   SPC?   c:Comment?   EOL   { return instr(o, a, c); }
Opcode "opcode"       =   [a-z]i+   { return text(); }
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
