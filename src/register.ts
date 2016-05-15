'use strict';





export default class Register {


    constructor(name?: string, value?: any) {
        this.name = name || 'Unnamed Register';
        this.value = value;
    }


    name: string;


    value: any;
}
