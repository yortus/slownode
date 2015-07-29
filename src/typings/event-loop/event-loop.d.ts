/// <reference path="../knex/knex.d.ts" />

declare module "event-loop" {
	import Knex = require("knex");
	
	export class EventLoop {
		
		constructor(databaseName: string, pollingDelay: number);
		store: Knex;
		pollingDelay: number;
		taskHandlers: TaskIndex;
		ready: Promise<boolean>;
		flushCallback: NodeJS.Timer;
		
		flush(): void;
		stop(): void;
		fetchNext(): Promise<EventTask>;
		
		addHandler(handler: TaskHandler): boolean;
		getHandler(topicFilter: string, functionId: string): TaskHandler;
		removeHandler(topicFilter: string, functionId: string): boolean;
		
		addTask(task: EventTask): any;
		runTask(task?: EventTask): Promise<boolean>
		removeTask(task: EventTask): any;
	}
	
	export interface EventTask {
		id: number;
		topicFilter: string;
		functionId?: string;
		task: any;
	}
	
	export interface TaskHandler {
		topicFilter: string;
		functionId: string;
		callback: (args: any) => Promise<any>;
	}
	
	export interface TaskIndex {
		[index: string]: TaskFunctions; 
	}
	
	export interface TaskFunctions {
		[index: string]: TaskHandler;
	}
	
	export interface TaskSchema {
		id?: number;
		runAt: number;
		runAtReadable: string;
		topicFilter: string;
		functionId: string;
		task: string;
	}
}