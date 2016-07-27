import compose from './compose';
import makeReference from './make-reference';
import Reviver from './reviver';
import {series, choice, option, zeroOrMore, oneOrMore, not, char, chars, lazy} from './util/parser-combinators';
import {Source, Parser} from './util/parser-combinators';





/**
  * Converts a Key/Value Object Notation (KVON) string into an object.
  * @param text A valid KVON string.
  * @param reviver A function that transforms the results. This function is called for each member of the object.
  * If a member contains nested objects, the nested objects are transformed before the parent object is.
  */
export default function parse(text: string, reviver?: Reviver | Reviver[]): {} {

    // Validate and normalize arguments.
    if (typeof text !== 'string') throw new Error("(KVON) expected `text` to be a string");
    reviver = normalizeReviver(reviver);

    // Recursively parse and revive the entire KVON text.
    let source = {text, len: text.length, pos: 0};
    let visited = new Map<string, {}>();
    WHITESPACE(source);
    let result = recurse(source, []);
    WHITESPACE(source);
    match(source, 'End of text', EOS);
    return result;

    /** Performs a single step of the recursive parsing process. */
    function recurse(src: Source, path: string[]): {} {
        let result: {};

        // We can always proceed deterministically with a single lookahead character. No backtracking is ever needed.
        const lookahead = src.text[src.pos];

        // Parse a null literal.
        if (lookahead === 'n') {
            match(src, 'null', NULL);
            result = null;
        }

        // Parse a boolean literal.
        else if (lookahead === 't' || lookahead === 'f') {
            match(src, 'boolean', JSON_BOOLEAN);
            result = lookahead === 't';
        }

        // Parse a numeric literal.
        else if (lookahead === '-' || (lookahead >= '0' && lookahead <= '9')) {
            result = parseFloat(capture(src, 'number', JSON_NUMBER));
        }

        // Parse a string literal. This includes 'reference' strings.
        else if (lookahead === '"') {
            // TODO: unescape... eg \n \r \u0032 etc...
            let rawString = capture(src, 'string', JSON_STRING);
            if (rawString[1] === '^') {
                // TODO: reference
                if (!visited.has(rawString)) throw new Error(`(KVON) invalid reference ${rawString}`);
                result = visited.get(rawString);
            }
            else {
                result = unescape(rawString);
            }
        }

        // Parse a plain array.
        else if (lookahead === '[') {
            let ar = [];
            match(src, '[', LEFT_BRACKET);
            WHITESPACE(src);
            while (src.text[src.pos] !== ']') {
                let element = recurse(src, path.concat(ar.length.toString())); // NB: recursive
                ar.push(element);
                WHITESPACE(src);
                if (!COMMA(src)) break;
                WHITESPACE(src);
            }
            match(src, ']', RIGHT_BRACKET);
            result = ar;
        }

        // Parse a plain object. This includes discriminates plain objects (DPOs).
        else if (lookahead === '{') {
            let obj = {}, isDiscriminated = false;
            match(src, '{', LEFT_BRACE);
            WHITESPACE(src);
            while (src.text[src.pos] !== '}') {
                let rawName = capture(src, 'string', JSON_STRING);
                isDiscriminated = isDiscriminated || rawName === '"$"';
                let name = unescape(rawName);
                WHITESPACE(src);
                match(src, 'colon', COLON);
                WHITESPACE(src);
                let value = recurse(src, path.concat(name)); // NB: recursive
                obj[name] = value;
                WHITESPACE(src);
                if (!COMMA(src)) break;
                WHITESPACE(src);
            }
            match(src, '}', RIGHT_BRACE);
            if (isDiscriminated) {
                // TODO: run reviver... this is the only case... explain why here, and document reviver rules in README...
                let revived = (<Reviver> reviver).call({'':obj}, '', obj); // TODO: throwaway object created every time here... reduce waste?
                let isRevived = !Object.is(obj, revived);
                obj = revived;

                // TODO: doc... if obj was an DPO but was left untouched by revivers, must be an error...
                // TODO: from stringify... If the value *was* replaced, then the replacement *must* be a discriminated plain object (DPO). Verify this.
                if (!isRevived) throw new Error(`(KVON) reviver failed to transform discriminated plain object`);
            }
            result = obj;
        }

        else {
            // TODO: the following is sure to throw since we've covered all valid options already...
            match(src, `null, boolean, string, number, array or object`, JSON_VALUE);
        }

        // TODO: update visited...
        visited.set(makeReference(path), result);
        return result;
    }

}









/** Returns a `Replacer` function that is equivalent to the passed in `replacer`, which may have several formats. */
function normalizeReviver(reviver: Reviver | Reviver[] | null): Reviver {
    return Array.isArray(reviver) ? compose(...reviver) : (reviver || NO_REVIVE);
}





/** A no-op reviver function. */
const NO_REVIVE = (key, val) => val;





// TODO: ...
function capture(src: Source, expected: string, expr: Parser) {
    let startPos = src.pos;
    match(src, expected, expr);
    let result = src.text.slice(startPos, src.pos);
    return result;
}





// TODO: ...
function match(src: Source, expected: string, expr: Parser) {
    if (expr(src)) return;
    let before = (src.pos > 10 ? '...' : '') + src.text.slice(src.pos - 10, src.pos);
    let after = src.text.slice(src.pos + 1, src.pos + 11) + (src.len - src.pos > 11 ? '...' : '');
    let indicator = `${before}-->${src.text[src.pos]}<--${after}`;
    throw new SyntaxError(`(KVON) expected ${expected} but found '${src.text[src.pos]}': "${indicator}"`);
}





// TODO: ...
function unescape(raw: string): string {
    // TODO: implement without JSON.parse?
    return JSON.parse(raw);
}





// JSON parsers...
// Terminals
const BACKSLASH = char('\\');
const COLON = char(':');
const COMMA = char(',');
const CONTROL_CHAR = char('\u0000', '\u001f');
const DECIMAL = char('.');
const DIGITS = oneOrMore(char('0', '9'));
const E = choice(char('e'), char('E'));
const EOS = not(char());
const FALSE = series(char('f'), char('a'), char('l'), char('s'), char('e'));
const HEX_DIGIT = choice(char('0', '9'), char('a', 'f'), char('A', 'F'));
const LEFT_BRACE = char('{');
const LEFT_BRACKET = char('[');
const MINUS = char('-');
const NULL = series(char('n'), char('u'), char('l'), char('l'));
const QUOTATION_MARK = char('"');
const RIGHT_BRACE = char('}');
const RIGHT_BRACKET = char(']');
const SIGN = choice(char('-'), char('+'));
const TRUE = series(char('t'), char('r'), char('u'), char('e'));
const WHITESPACE = zeroOrMore(choice(char(' '), char('\t'), char('\r'), char('\n')));
const ZERO = char('0');

// JSON Boolean
const JSON_BOOLEAN = choice(TRUE, FALSE);

// JSON Number
const INTEGER_PART = choice(ZERO, DIGITS);
const FRACTIONAL_PART = option(series(DECIMAL, DIGITS));
const EXPONENT_PART = option(series(E, option(SIGN), DIGITS));
const JSON_NUMBER = series(option(MINUS), INTEGER_PART, FRACTIONAL_PART, EXPONENT_PART);

// JSON String
const UNESCAPED_CHAR = series(not(choice(QUOTATION_MARK, BACKSLASH, CONTROL_CHAR)), char());
const ESCAPED_CONTROL_CHAR = series(BACKSLASH, chars('"', '\\', '/', 'b', 'f', 'n', 'r', 't'));
const ESCAPED_UNICODE_CHAR = series(BACKSLASH, char('u'), HEX_DIGIT, HEX_DIGIT, HEX_DIGIT, HEX_DIGIT)
const ESCAPED_OR_UNESCAPED_CHAR = choice(UNESCAPED_CHAR, ESCAPED_CONTROL_CHAR, ESCAPED_UNICODE_CHAR);
const JSON_STRING = series(QUOTATION_MARK, zeroOrMore(ESCAPED_OR_UNESCAPED_CHAR), QUOTATION_MARK);

// JSON Array
const COMMA_LIST = (expr: Parser) => series(expr, zeroOrMore(series(WHITESPACE, COMMA, WHITESPACE, expr)));
const JSON_ARRAY = series(LEFT_BRACKET, WHITESPACE, option(COMMA_LIST(lazy(() => JSON_VALUE))), WHITESPACE, RIGHT_BRACKET);

// JSON Object
const NAME_VALUE_PAIR = series(JSON_STRING, WHITESPACE, COLON, WHITESPACE, lazy(() => JSON_VALUE));
const JSON_OBJECT = series(LEFT_BRACE, WHITESPACE, option(COMMA_LIST(NAME_VALUE_PAIR)), WHITESPACE, RIGHT_BRACE);

// Any JSON Value
const JSON_VALUE = choice(NULL, JSON_BOOLEAN, JSON_NUMBER, JSON_STRING, JSON_ARRAY, JSON_OBJECT);
