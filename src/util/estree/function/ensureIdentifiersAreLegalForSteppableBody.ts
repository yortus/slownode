import _ = require('lodash');
import classifyIdentifiers = require('./classifyIdentifiers');
export = ensureIdentifiersAreLegalForSteppableBody;


// TODO: ensure locals don't shadow any non-locals


/**
 * Traverses the AST and throws an error if an identifier is not considered legal in a Steppable body. A legal identifier:
 * - must not have the name '$'.
 * - must not contain exotic characters (ie any character other than a-z, A-Z, 0-9, $, and _).
 * - must refer either to a local, module, or global variable (ie no references to ids in the function's lexical scope / no closures).
 * - must not be block-scoped (ie let vars; const and catch vars are treated specially and are hence allowed).
 */
function ensureIdentifiersAreLegalForSteppableBody(func: ESTree.Function) {

    // Classify all identifiers referenced by the function.
    var ids = classifyIdentifiers(func);

    // Disallow 'let'-declared local identifiers.
    if (ids.local.let.length > 0) {
        throw new Error(`Steppable: block scoped variables are not allowed within the steppable body ('${ids.local.let.join("', '")}')`);
    }

    // Disallow 'scoped' identifiers (ie IDs that make the function a proper closure).
    if (ids.scoped.length > 0) {
        throw new Error(`Steppable: variables that are neither local nor global are not allowed within the steppable body ('${ids.scoped.join("', '")}')`);
    }

    // Disallow '$' and exotic names.
    var legalNameRegex = /^(?!\$$)[a-zA-Z$_][a-zA-Z$_0-9]*$/;
    var allIds = _.unique([].concat(ids.local.var, ids.local.const, ids.local.catch, ids.global));
    var badNames = allIds.filter(id => !legalNameRegex.test(id));
    if (badNames.length > 0) {
        throw new Error(`Steppable: invalid or disallowed identifier name(s): '${badNames.join("', '")}')`);
    }
}
