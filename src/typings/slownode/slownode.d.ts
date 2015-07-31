/// <reference path="../knex/knex.d.ts" />
/// <reference path="../node/node.d.ts" />

declare module "slownode" {
	import Knex = require("knex");
	
	export function setTimeout(func: SlowFunction, milliseconds: number): Promise<number>;
	export function setImmediate(func: SlowFunction): Promise<number>;
	export function setInterval(funct: SlowFunction, milliseconds: number): Promise<number>; 
	
	export interface SlowNodeStatic {
		EventEmitter: any;
	}
	
	export class SlowEventEmitter {
		
	}
	
	export interface SlowEventLoop {		
				
		config: EventLoopConfig;
		flushCallback: NodeJS.Timer;
		ready: Promise<boolean>;
		
		start(): void;
		stop(): void;
		
		addCall(operation: SlowFunction): any;
		getNextCall(): Promise<SlowFunction>;
		processCall(task?: SlowFunction): Promise<boolean>
		removeCall(task: SlowFunction): any;
	}
	
	export interface SlowFunction {
		id?: number;
		functionId: string;
		runAt?: number;
		arguments: any;
	}
	
	export interface Subscriber {
		id: string;
		callback: (args: any) => Promise<any>;
	}
	
	export interface EventLoopSchema {
		id?: number;
		functionId: string
		runAt: number;
		runAtReadable: string;
		arguments: string;
	}
	
	export interface EventLoopConfig {
		retryCount?: number;
		retryIntervalMs?: number;
		pollIntervalMs?: number;
		database: string;
	}
}