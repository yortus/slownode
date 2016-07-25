// TODO: doc KVON (in README?)
// - strictness - ie no silent roundtrip failures - parse(stringify(x)) must result in something that is observably identical to x, otherwise stringify/parse must throw
// - replacers - must either leave value unchanged or return a 'serializable' value
// - replacers - may return a plain object with the special discriminant prop '$type', but may *not* use $type:'ref' or $type:'esc'
// - revivers - returning `undefined` does *not* delete the key from the output object (as in the ECMA spec), it means the value is revived into a literal `undefined`
// - duality - a reviver can't touch anything not touched by any replacer, and vice versa, et cetera
// - special treatment of '$type' property - safe to use as a discriminant in serializable forms because it is auto-escaped/unescaped in non-replaced encounters
import * as KVON from './kvon';
export default KVON;
