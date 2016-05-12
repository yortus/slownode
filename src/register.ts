'use strict';





export default class Register {


    constructor(name?: string) {
        this.name = name || 'Unnamed Register';
    }


    name: string;


    value: any;
}
