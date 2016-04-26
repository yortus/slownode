'use strict';
import * as assert from 'assert';
import Environment from './environment'; // For type only (no circular ref)
import {Node} from 'babel-types';





export interface Options {
    hoisted?: boolean;
    immutable?: boolean;
    declaration?: Node;
}





export default class Binding {


    constructor(environment: Environment, name: string, options: Options) {
        this.environment = environment;
        this.name = name;
        this.isInitialized = false;
        this.isHoisted = !!options.hoisted;
        this.isImmutable = !!options.immutable;
        this.declaration = options.declaration || null;
        this.initializeIfHoisted();
    }


    initialize(value: any) {
        assert(!this.isInitialized);
        this.isInitialized = true;
        this._value = value;
    }


    get value(): any {
        if (this.isInitialized) return this._value;
        throw new ReferenceError(`'${this.name}' is not defined'`);
    }


    set value(value: any) {
        if (!this.isInitialized) throw new ReferenceError(`'${this.name}' is not defined'`);
        if (this.isImmutable) throw new TypeError(`'${this.name}' is immutable`);
        this._value = value;
    }


    environment: Environment;


    name: string;


    isInitialized: boolean;


    isHoisted: boolean;


    isImmutable: boolean;


    declaration: Node;


    private _value: any;


    private initializeIfHoisted() {
        if (!this.isHoisted) return;
        assert(this.declaration, 'Hoisted bindings must have a declaration node');

        // If it's a 'var', just initialize it to 'undefined'
        if (this.declaration.type === 'VariableDeclarator') {
            this.initialize(void 0);
        }

        // TODO: handle FunctionDeclaration, imports, etc...
        else {
            throw new Error('not implemented');
        }
    }
}
