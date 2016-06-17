
interface Array<T> {}
interface Boolean {}
interface Function {}
interface IArguments {}
interface Number {}
interface Object {}
interface RegExp {}
interface String {}
interface Promise<T> {}
declare var Infinity;
declare var NaN;


declare function print(message: string);


declare function sleep(ms: number): Promise<void>;


declare function sleepThenFail(ms: number, message: string): Promise<void>;
