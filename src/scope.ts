'use strict';
import * as assert from 'assert';





export default class Scope {


    constructor(parent?: Scope) {
        this._parent = parent;
    }


    createLocal(name: string, value?: any) {
        assert(!this.existsLocal(name));
        this._locals[name] = value;
    }


    deleteLocal(name: string) {
        assert(this.existsLocal(name));
        delete this._locals[name];
    }


    existsLocal(name: string): boolean {
        return this._locals.hasOwnProperty(name);
    }


    getValue(name: string) {
        let scope = this.findScopeOf(name);
        return scope._locals[name];
    }


    setValue(name: string, value: any) {
        let scope = this.findScopeOf(name);
        scope._locals[name] = value;
    }


    private findScopeOf(name: string) {
        let scope: Scope = this;
        while (scope && !scope.existsLocal(name)) {
            scope = scope._parent;
        }
        assert(scope, `Variable '${name}' is not defined.`);
        return scope;
    }


    private _locals = {};


    private _parent: Scope;
}
