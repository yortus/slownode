export default Reviver;





interface Reviver {
    (this: {}, key: string, val: {}): {};
}
