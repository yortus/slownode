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
		configuration: Config;
		flushCallback: NodeJS.Timer;

		start(): Promise<boolean>;
		stop(): Promise<boolean>;
		flush(): Promise<any>;

		addCall(operation: SlowFunction): any;
		getNextCall(): Promise<SlowFunction>;
		processCall(task?: SlowFunction): Promise<boolean>
		removeCall(task: SlowFunction): any;
	}

	export interface SlowFunction {
		id?: number;
		runAt?: number;
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
			id?: number;
			functionBody: string;
			dependencies: string;
			intervalMs: number;
			retryCount: number;
			retryIntervalMs: number;
		}

		export interface EventLoop {
			id?: number;
			functionId: string;
			runAt: number;
			runAtReadable?: string;
			repeat?: number;
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