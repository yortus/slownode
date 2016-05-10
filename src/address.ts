'use strict';





export default class Address {

    constructor(obj: any, key: string|number) {
        this.obj = obj;
        this.key = key;
    }

    fetch(): any {
        return this.obj[this.key];
    }

    store(val: any): void {
        this.obj[this.key] = val;
    }

    obj: any;

    key: string|number;
}
