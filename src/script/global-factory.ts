import KVON from '../kvon';





// TODO: ...
export default GlobalFactory;
interface GlobalFactory {

    // TODO: ...
    create(): Object;

    // TODO: ...
    replacer?: KVON.Replacer;

    // TODO: ...
    reviver?: KVON.Reviver;

    // TODO: ... contents of .d.ts
    typeDefinition?: string;

}
