'use strict';
import * as assert from 'assert';
import Environment from './environment'; // For type only (no circular ref)





export default class Binding {


    constructor(environment: Environment, name: string, immutable?: boolean) {
        this.environment = environment;
        this.name = name;
        this.isInitialized = false;
        this.isImmutable = !!immutable;
    }


    initialize(value: any) {
        assert(!this.isInitialized);
        this.isInitialized = true;
        this._value = value;
    }


    get value(): any {
        if (!this.isInitialized) throw new ReferenceError(`'${this.name}' is not defined'`);
        return this._value;
    }


    set value(value: any) {
        if (!this.isInitialized) throw new ReferenceError(`'${this.name}' is not defined'`);
        if (this.isImmutable) throw new TypeError(`'${this.name}' is immutable`);
        this._value = value;
    }


    environment: Environment;


    name: string;


    isInitialized: boolean;


    isImmutable: boolean;


    private _value: any;
}
