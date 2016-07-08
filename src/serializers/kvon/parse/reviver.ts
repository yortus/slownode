export default Reviver;
import {Serializable} from '../serializable-types';





type Reviver = (this: Serializable, key: string, val: Serializable) => {};
