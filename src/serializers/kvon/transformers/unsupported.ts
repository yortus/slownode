// TODO: run this last! Collect *known* unsupported things in here, for the purpose of preventing their silent pass-through,
// and delivering a clear error message. If any of these things gain future support, they can be removed from here.
// - getters/setters
// - properties with non-default descriptors
// - frozen stuff
// - etc etc...





// TODO: implement...





export function replacer(key, val) {
    throw new Error(`Not implemented`);
}





export function reviver(key, val) {
    throw new Error(`Not implemented`);
}
