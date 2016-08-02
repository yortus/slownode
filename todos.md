## TODOs:
- [ ] src/kvon is pretty clean now, but not so fast according to warp10 benchmarks
  - Not so fast is fine for slownode, but still it could be reviewed to go back to using native JSON for actual stringification/parsing, and KVON code just transforms the object graph. But that would not allow '^' and '$' special strings as they currently are handled
- [ ] Script: lots of TODOs and cleanup needed in src/script
- [ ] Script: tests need review for coverage. Also one test file is currently commented out.
- [ ] Script: support more JS/TS syntax. List what's supported and what's not in the README.
- [ ] Epoch: lots of TODOs and cleanup needed in src/epoch
- [ ] Epoch: use Script#canSnapshot to work out how/when to park each running script and how to resume it
- [ ] Epoch: add Epoch#shutdown to simulate process exit without actually exiting. Useful for unit testing Epoch instances.
- [ ] Epoch: what to do with failed scripts? Could leave that up to consumer, since script is passed to any attached 'error' listeners
- [ ] Epoch: need more unit tests - esp fixtures in separate files.
- [ ] refactor global object factory and lib.slow.d.ts (global-object.d.ts?)
- [ ] standard library... also matching replacers/revivers as required
- [ ] www: restore static checks (ie tsc) in www/ browser version - see kludge in static-check.ts
- [ ] www: restore/add ability to run/step through code. Add a button for this instead of just doing it on every edit.
- [ ] *early* error for unawaited promise - preferably static check - use tsc somehow? or some heuristic?
- [x] implement stepper-to-jasm
- [x] instr/opcode casing - use consistently. Make jasm opcodes/directives/registers/labels case-insensitive?
- [x] Epochs - automatically load & save scripts using fs
- [x] neaten JASM formatting in emitted JASM
- [x] export proper API, including Epoch and converters
- [x] better interleaving of source code and instructions in emitted JASM
- [x] get rid of typings.d.ts
- [x] ~~get rid of Label.ts~~ actually, leave it in. It's well-localised now.
- [x] get rid of the `async () => {` and `})()` artefacts in source interleaving
- [x] src/formats/ is not well structured. Some types are really shared between jasm and stepper
- [x] source interleaving: 'zip' jasm and ts lines together guided by 'sync points'
- [x] turn Stepper in to a standard Iterator<void> interface





## Explanatory Notes for Formats/Transitions:

### Three Formats:

1. **Readable** - a textual representation suitable for authoring by a human developer (also: Writable)
2. **Runnable** - an ephemerial runtime representation suitable for step-wise execution and inspection
3. **Storable** - a serialized representation suitable for persistent storage

### Three Transitions:

1. **Readable to Storable**
  - transpilation from source script to JASM instruction sequence
  - serialization of default register set including ENV = global object

2. **Runnable to Storable**
  - extraction of JASM instruction sequence (one-liner via retained reference to JASM source)
  - serialization of current state (one-liner via KVON#stringify)

3. **Storable to Runnable**
  - compilation of JASM instruction sequence into an object akin to a generator object with a step/next method.
  - deserialization of state from KVON format into a state object





## JASM Notes
- line-based
- 3 line types: instruction, label, blank
- comments start with ';' and run to end of line
- comments are preserved in JASM code
- canonical instruction lines are aligned with spaces; opcodes start at column 4, args start at column 12
- canonical label lines are not indented
- SUPPORTED:
  - 
- PARTIALLY SUPPORTED:
 - 
- UNSUPPORTED:
  - function declarations
  - function expressions
  - class declarations
  - class expressions





## KVON Notes
- strictness - no silent roundtrip failures - parse(stringify(x)) must result in something that is functionally identical to x, otherwise stringify/parse must throw
- replacers and revivers must occur in dualistic pairs.
- If a `replacer` function returns a replacement value, then the replacement *must* be a discriminated plain object (DPO).
- `reviver` functions will only ever be called with DPO values.
  - TODO: simplify builtin revivers to exploit the ^^^ previous invariant
- if a replacer replaces a value, it's pair reviver must revive the replacement value back to the original value.
- if a replacer does not act on a value, it's dual reviver must not act on that value either.
- replacers may not mutate the object containing the value being replaced/revived (passed as `this`).
- revivers always receive `null` for their `this` context (unlike JSON revivers).
- Circular references in object graphs are not supported. But identities *are* preserved for values that recur in DAGs.
- stringify: toJSON is not supported (not reversible)
- stringify `space` parameter: strings containing non-whitespace characters are not supported (not reversible)
- stringify `replacer` parameter: 'whitelist' arrays of property names are not supported (not reversible)
- stringify `replacer` parameter: omitting properties by returning `undefined` from function is not supported
- parse `reviver` parameter: omitting properties by returning `undefined` from function is not supported
- Glossary terms:
  - 'Discriminated Plain Object' (DPO) - plain object with a '$' key
  - 'Discriminant key' - '$'
  - 'Reference' value - string starting with '^'. '^' and '.' are special chars.





## Notes on Script Class Implementation
- recomputing `canSnapshot` on each step:
  - upon completion of current instr...

    - if `canSnapshot` is currently `true`:
      - if instr is a CALL or NEW, and return value assigned to register is not serializable
        - set `canSnapshot` to `false`
      - NB: any other way for a non-serializable to enter system without CALL or NEW? Not if all builtin types/ops are serializable...

    - if `canSnapshot` is currently `false`:
      - if ALL registers are now serializable (using KVON.canStringify on whole register set)...
        - set canSnapshot to `true`

      - NB: more optimal checking if instr potentially destroys data reachable from registers...
        - safe but slow method: assume ANY instr can do this...
        - possible optimisations - but MUST doc/clarify/modify codegen assumptions here!
          - opcode is UNDEFD (clears registers after use)
          - any instr whose output register is also an input register (ie overwrites)...
          - any instr that executes external code that might mutate reachable data...





## Notes on Slow Scripting

- [ ] lib.slow.d.ts and the global object are built-in and controlled by the slownode library. Allow options later.
  - [ ] support sleep function (`sleepFor(duration)` AND `sleepUntil(time)`) / `SleepPromise` type
  - [ ] Promises as 'opaque' objects
  - [ ] support for database access (use wrapped 'knex')
  - [ ] support for file system access (use wrapped 'fs')
  - [ ] support for network access (use wrapped 'http'/'https')
- [ ] type-checking (via tsc) is automatically on by default for script evaluation. Allow options later.
- [ ] replacer/reviver types are builtin by default. Allow options later.
- [ ] persistence is filesystem-based by default. Directory may be specified as an option. Allow other options later.

- [ ] don't provide/allow primitives/globals/builtins that execute a callback asynchronously
  - e.g. setTimeout, node-style APIs, event emitters, observables, Promise#then, etc
- [ ] treat Promise instances specially
  - the only operation allowed on a promise instance `p` is `await p` (must be checked at runtime at every expression evaluation)
  - corralary of previous: promise instances cannot be assigned, passed as args, have members called, etc... How to enforce?
  - promise values cannot be simply discarded without use (could add a DISCARD #REG opcode to indicate a register is being released from use.)
  - NB: Is this true?: promise instances can only be produced as the return value from a function call, or from new Promise(...).
    - this truth may help narrow down where to check for promises entering the VM
- [ ] what about FRP? Might be convenient to be able to do `source.on('data', data => ...)` in a slow script.
  - but what about missed events? If the process went down/restarted... unreliable...
  - perhaps support sources that are themselves 'slow' in some way... What does this mean?
    - the slow scripts in a epoch could be an interacting ecosystem...
    - some of the scripts are event sources - internally they may poll, externally they emit events
    - some of the scripts are event sinks - they consume the events produced from the slow event sources
    - as long as they are all in the same epoch, and the scripts are 'robust' (define this!), no events will get lost.
    - robust event source - if an erorr occurs, it either recovers and continues, or it takes down the whole epoch... or...?





## Sample Workflows

```ts
// file: approve-leave-request-workflow.ts
// NB: Call this as soon as a new leave request is created
async function approveLR(lrid: number) {

    // while not approved/rejected
        // if 14+ days passed since application
            // escalate to sysadmin via email...
        // notify/remind approver via email
        // sleep 2 days
    // notify applicant of outcome via email
}
```
