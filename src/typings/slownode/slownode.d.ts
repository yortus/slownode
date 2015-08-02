/// <reference path="../knex/knex.d.ts" />
/// <reference path="../node/node.d.ts" />

declare module "slownode" {
	import Knex = require("knex");
	
	export interface SlowNodeStatic {
		configuration: Config;
		
		setTimeout(func: () => any, delayMs: number): Promise<number>;
		setImmediate(func: () => any): Promise<number>;
		setInterval(funct: () => any, delayMs: number): Promise<number>;
		
		EventEmitter: SlowEventEmitter;
		EventLoop: SlowEventLoop;
		Promise: SlowPromise;
		
		start(config: Config): Promise<boolean>;
		stop(): Promise<boolean>;
	}
	
	export class SlowPromise {
		
	}

	export class SlowEventEmitter {

	}

	export interface SlowEventLoop {
		pollIntervalMs: number;
		flushCallback: NodeJS.Timer;

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
		repeat: number;
		runAt: number;
		runAtReadable: string;
		arguments: string;
	}

	export interface Config {
		retryCount?: number;
		retryIntervalMs?: number;
		pollIntervalMs?: number;
	}
	
	export interface EventTable {
		id?: number;
		topic: string;
		arguments: string;
		createdAt: number;
		createdAtReadable: string;
	}
	
	export interface FunctionTable {
		id?: number;
		functionId: string;
		functionBody: string;
	}
	
	export interface EventLoopTable {
		id?: number;
		functionId: string;
		functionBody: string;
		runAt: number;
		runAtReadable?: string;
		repeat?: number;
		arguments?: string;
	}
	
	export interface EventListenerTable {
		id?: number;
		topic: string;
		functionId: string;
		runOnce: number;
	}
}