/// <reference path="../knex/knex.d.ts" />
/// <reference path="../node/node.d.ts" />

declare module "slownode" {
	import Knex = require("knex");

	export interface SlowNodeStatic {
		configuration: Config;
		connection: Knex;
		flushCallback: NodeJS.Timer;
		
		start(config: Config): Promise<boolean>;
		stop(): Promise<boolean>;

		setTimeout(func: () => any, delayMs: number, options?: SlowFunctionOptions): Promise<number>;
		setImmediate(func: () => any, options?: SlowFunctionOptions): Promise<number>;
		setInterval(funct: () => any, delayMs: number, options?: SlowFunctionOptions): Promise<number>;
		
		Promise: any;
		Event: any;
	}

	export class SlowPromise {

	}

	export class SlowEventEmitter {

	}

	export interface SlowEventLoop {
		add(functionId: string, options: SlowFunctionOptions, ...args: any[]): any;
		getNext(): Promise<Schema.EventLoop>;
		run(task?: Schema.EventLoop): Promise<boolean>
		remove(functionId: string): any;
	}

	export interface SlowFunction {
		id?: string;
		body: (...args: any[]) => any;		
		options: SlowFunctionOptions;
	}
	
	export interface SlowFunctionOptions {
		dependencies?: Array<Dependency>
		runAt?: number;
		intervalMs?: number;
		retryCount?: number;
		retryIntervalMs?: number;
		arguments?: {};
		trx?: any;
	}
	
	export interface Dependency {
		reference?: string;
		value?: any;
		as: string;
	}

	export interface Subscriber {
		id: string;
		callback: (args: any) => Promise<any>;
	}

	export interface Config {
		pollIntervalMs?: number;
	}

	export module Schema {
		
		export interface Event {
			id?: number;
			topic: string;
			arguments: string;
			createdAt: number;
			createdAtReadable: string;
		}

		export interface Function {
			id?: string;
			body: string;
			dependencies: string;
			intervalMs: number;
			retryCount: number;
			retryIntervalMs: number;
		}

		export interface EventLoop {
			id?: number;
			funcId: string;
			runAt: number;
			runAtReadable?: string;
			arguments?: string;
		}

		export interface EventListener {
			id?: number;
			topic: string;
			functionId: string;
			runOnce: number;
		}
	}
}