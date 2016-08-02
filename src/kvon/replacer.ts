export default Replacer;





/** The replacer function accepted by KVON#stringify. */
interface Replacer {
    (this: {}, key: string, val: {}): {};
}
