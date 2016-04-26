'use strict';
import * as assert from 'assert';
import Binding, {Options as BindingOptions} from './binding';





export default class Environment {


    constructor(outer?: Environment) {
        this.outer = outer || null;
    }


    createBinding(name: string, options?: BindingOptions): Binding {
        assert(this._bindings.every(b => b.name !== name));
        let newBinding = new Binding(this, name, options);
        this._bindings.push(newBinding);
        return newBinding;
    }


    deleteBinding(name: string): void {
        let index = this._bindings.findIndex(b => b.name === name);
        assert(index !== -1);
        this._bindings.splice(index, 1);
    }


    hasBinding(name: string): boolean {
        return !!this.getBinding(name);
    }


    getBinding(name: string): Binding {
        let env: Environment = this, binding;
        while (env && !binding) {
            binding = env._bindings.find(b => b.name === name);
            if (!binding) env = env.outer;
        }
        return binding;
    }


    createInnerEnvironment(): Environment {
        let newEnv = new Environment(this);
        return newEnv;
    }


    outer: Environment;


    private _bindings: Binding[] = [];
}
