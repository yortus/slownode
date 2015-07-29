/// <reference path="../knex/knex.d.ts" />

declare module "event-loop" {
	import Knex = require("knex");
	
	export class EventLoop {
		
		constructor(config: EventLoopConfig);
		private store: Knex;
		private pollInterval: number;
		private subscribers: Array<Subscriber>;
		public ready: Promise<boolean>;
		private flushCallback: NodeJS.Timer;
		
		public start(): void;
		public stop(): void;
		
		public subscribe(subscriber: Subscriber): boolean;
		private getSubscriber(topicFilter: string, functionId: string): Subscriber;
		private removeSubscriber(topicFilter: string, functionId: string): boolean;
		
		public publish(task: Event): any;
		private getNextEvent(): Promise<Event>;
		private runEvent(task?: Event): Promise<boolean>
		private removeEvent(task: Event): any;
	}
	
	export interface Event {
		id: number;
		eventName: string;
		subscriberId?: string;
		event: any;
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
		subscriberId: string;
		task: string;
	}
	
	export interface EventLoopConfig {
		retryCount: number;
		retryIntervalMs: number;
		pollInterval: number;
		database: string;
	}
}