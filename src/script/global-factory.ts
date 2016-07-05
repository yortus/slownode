import {Replacer, Reviver} from '../serializers';





// TODO: ...
export default GlobalFactory;
interface GlobalFactory {

    // TODO: ...
    create(): Object;

    // TODO: ...
    replacer?: Replacer;

    // TODO: ...
    reviver?: Reviver;

    // TODO: ... contents of .d.ts
    typeDefinition?: string;

}
