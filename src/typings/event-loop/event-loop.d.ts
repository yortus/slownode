/// <reference path="../knex/knex.d.ts" />

declare module "event-loop" {
	import knex = require("knex");
	
	export class EventLoop {
		
		constructor(databaseName: string, pollingDelay: number);
		store: knex;
		pollingDelay: number;
		taskHandlers: TaskIndex;
		flush(): void;
		runTask(task?: EventTask): void;
		fetchNext(): Promise<EventTask>;
		addTaskHandler(handler: TaskHandler): boolean;
		removeTaskHandler(topicFilter: string, functionId: string): boolean;
	}
	
	export interface EventTask {
		id: number;
		topicFilter: string;
		funcitonId: string;
		args: any;
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
		id: number;
		runAt: number;
		runAtReadable: string;
		topicFilter: string;
		functionId: string;
		task: string;
	}
}