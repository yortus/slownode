export default Reviver;





/** The reviver function accepted by KVON#parse. */
interface Reviver {
    (this: {}, key: string, val: {}): {};
}
