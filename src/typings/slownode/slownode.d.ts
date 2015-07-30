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
	
	export class SlowEventLoop {
		
		constructor(config: EventLoopConfig);
		config: EventLoopConfig;
		store: Knex;
		flushCallback: NodeJS.Timer;
		
		start(): void;
		stop(): void;
		
		publish(task: Event): any;
		getNextEvent(): Promise<Event>;
		processEvent(task?: Event): Promise<boolean>
		removeEvent(task: Event): any;
	}
	
	export interface Event {
		id: number;
		eventName: string;
		event: any;
		runAt: number;
	}
	
	export interface Subscriber {
		id: string;
		callback: (args: any) => Promise<any>;
	}
	
	export interface EventSchema {
		id?: number;
		runAt: number;
		runAtReadable: string;
		eventName: string;
		event: string;
	}
	
	export interface EventLoopConfig {
		retryCount?: number;
		retryIntervalMs?: number;
		pollIntervalMs?: number;
		database: string;
	}
	
	export interface SlowFunction {
		
	}
}