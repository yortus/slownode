import compose from './compose';
import makeReference from './make-reference';
import Reviver from './reviver';
import {series, choice, option, zeroOrMore, oneOrMore, not, char, chars, lazy} from './util/parser-combinators';
import {Source, Parser} from './util/parser-combinators';





// TODO: ensure no deps on JSON in KVON implementation...
// TODO: KVON#canStringify...





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
    let result = parseValue(source, []);
    WHITESPACE(source);
    match(source, 'End of text', EOS);
    return result;

    /** Parses and revives a single complete KVON value starting at the current position in `src`. */
    function parseValue(src: Source, path: string[]): {} {
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
            let rawString = capture(src, 'string', JSON_STRING);
            if (rawString[1] === '^') {

                // Parse a 'reference' string. It must refer to a path already aded to `visited` (else ref is invalid).
                if (!visited.has(rawString)) throw new Error(`(KVON) invalid reference ${rawString}`);
                result = visited.get(rawString);
            }
            else {

                // Parse an ordinary string.
                result = unescape(rawString);
            }
        }

        // Parse a plain object or array. This includes discriminated plain objects (DPOs).
        // Plain objects and arrays are handled together here since many steps are the same.
        else if (lookahead === '{' || lookahead === '[') {
            let isObject = lookahead === '{';
            let obj = isObject ? {} : [];
            let isDPO = false;
            let closingBrac = isObject ? RIGHT_BRACE : RIGHT_BRACKET;

            // Advance past the opening brace/bracket.
            ++src.pos;
            WHITESPACE(src);

            // Parse all pair/elements in the object/array.
            while (!check(src, closingBrac)) {
                let key: string;
                if (isObject) {

                    // Parse the key and the colon of a key/value pair. Also detect whether we have a DPO.
                    let rawKey = capture(src, 'string', JSON_STRING);
                    isDPO = isDPO || rawKey === '"$"';
                    key = unescape(rawKey);
                    WHITESPACE(src);
                    match(src, 'colon', COLON);
                    WHITESPACE(src);
                }
                else {

                    // Determine the key coresponding to the next unused array element.
                    key = (<any[]> obj).length.toString();
                }

                // Parse an object value or an array element. This step is recursive.
                let value = parseValue(src, path.concat(key));
                obj[key] = value;

                // Parse the comma between elements/pairs. This implementation also tolerates trailing commas.
                WHITESPACE(src);
                if (!COMMA(src)) break;
                WHITESPACE(src);
            }

            // Match the closing brace/bracket.
            match(src, isObject ? '}' : ']', closingBrac);

            // If the parsed object is a DPO, it must be revived. This is the only case where `reviver` is used, as per
            // KVON rules. That is, every reviver must operate as the dual of its replacer. Recall that replacers must
            // either return a DPO or leave the value unchanged. If we *don't* have a DPO here, then the value could not
            // possibly have been generated by a replacer, therefore it could not possibly be affected by a (valid)
            // reviver. Additionally, if we *do* have a DPO here, then it *must* be revived by the reviver.
            if (isDPO) {
                let revived = (<Reviver> reviver).call({'':obj}, '', obj); // TODO: throwaway object created every time here... reduce waste?
                let isRevived = !Object.is(obj, revived);
                if (!isRevived) throw new Error(`(KVON) reviver failed to transform discriminated plain object`);
                obj = revived;
            }
            result = obj;

            // A complete object or array value has now been parsed and revived from `src`. Since objects and arrays may
            // be aliased multiple times in an object graph, we add the just-parsed value to `visited`, keyed against
            // the 'reference' string corresponding to the current path. Any future occurences of this 'reference'
            // string in the object graph will then return this same value.
            visited.set(makeReference(path), result);
        }

        // We have covered all possible valid lookahead characters in the previous
        // cases, so if we reach here, `text` cannot possibly be valid KVON.
        else {
            match(src, `null, boolean, string, number, array or object`, JSON_VALUE);
        }

// TODO:...
        return result;
    }
}





/** Returns a `Reviver` function that is equivalent to the passed in `reviver`, which may have several formats. */
function normalizeReviver(reviver: Reviver | Reviver[] | null): Reviver {
    return Array.isArray(reviver) ? compose(...reviver) : (reviver || NO_REVIVE);
}





/** A no-op reviver function. */
const NO_REVIVE = (key, val) => val;





/** Accepts a JSON-encoded string literal, and returns the decoded string literal that it represents. */
function unescape(raw: string): string {
    // TODO: implement without JSON.parse?
    return JSON.parse(raw);
}





/** Matches `expr` at the current position in `src`, advances the source position, and returns the matched substring. */
function capture(src: Source, expected: string, expr: Parser) {
    let startPos = src.pos;
    match(src, expected, expr);
    let result = src.text.slice(startPos, src.pos);
    return result;
}





/**
 * Asserts that `src` contains the pattern represented by `expr` at the current position, and advances the source
 * position past it accordingly. If the match fails, a SyntaxError is thrown with details about the failed match.
 */
function match(src: Source, expected: string, expr: Parser): void {
    if (expr(src)) return;
    let before = (src.pos > 10 ? '...' : '') + src.text.slice(src.pos - 10, src.pos);
    let after = src.text.slice(src.pos + 1, src.pos + 11) + (src.len - src.pos > 11 ? '...' : '');
    let indicator = `${before}-->${src.text[src.pos]}<--${after}`;
    throw new SyntaxError(`(KVON) expected ${expected} but found '${src.text[src.pos]}': "${indicator}"`);
}





/**
 * Checks whether `src` contains the pattern represented by `expr`
 * at the current position, without advancing the source position.
 */
function check(src: Source, expr: Parser): boolean {
    let oldPos = src.pos;
    let result = expr(src);
    src.pos = oldPos;
    return result;
}





// ========== The remaining declarations are parsers for the various components of JSON. ==========
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
