var main = require('../mainInfo');
// List the available storage adapter names.
var adapterNames = ['sqliteInFiber'];
// Determine the adapter to use based on what's in the main package.json file. Fail early if no valid adapter can be determined.
var selectedAdapterName = (main.packageJson.slownode || {}).storage || null;
var errorPart2 = "Please set the slownode.storage key to one of the following values: '" + adapterNames.join("', '") + "'.";
if (!selectedAdapterName) {
    throw new Error("slownode: no storage adapter specified in package.json. " + errorPart2);
}
if (adapterNames.indexOf(selectedAdapterName) === -1) {
    throw new Error("slownode: invalid storage adapter '" + selectedAdapterName + "' specified in package.json. " + errorPart2);
}
// Load the adapter.
var implementation = require("./" + selectedAdapterName);
module.exports = implementation;
//# sourceMappingURL=storage.js.map