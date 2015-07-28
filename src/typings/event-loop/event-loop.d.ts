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
		[index: string]: (args: any) => Promise<any>;
	}
}