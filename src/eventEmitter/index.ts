import Types = require("slownode");
import listenerStore = require("../store/listener");
import funcStore = require("../store/slowFunction");
import loopStore = require("../store/eventLoop");


/**
 * 
 * Implicit events when adding/removing listeners:
 * 'newListener'
 * 'removeListener'
 * 
 */


export function addListener(event: string, listener: (...args: any[]) => any) {

}

export function on(event: string, listener: (...args: any[]) => any) {
	return addListener(event, listener);
}

export function once(event: string, listener: (...args: any[]) => any) {
	
}

export function removeListener(event: string) {
	
}

export function removeListeners(event: string) {
	
}

export function listeners(event: string) {
	
}

export function emit(event: string, ...args: any[]): Promise<boolean> {
	return listenerStore.getListeners(event)
		.then(listeners => loopStore.execListeners(listeners, args))	
}