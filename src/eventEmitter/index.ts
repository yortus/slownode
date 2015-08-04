/**
 * 
 * Implicit events when adding/removing listeners:
 * 'newListener'
 * 'removeListener'
 * 
 */


export function addListener(event: string, listener: any) {
	
}

export function on(event: string, listener: any) {
	return addListener(event, listener);
}

export function once(event: string, listener: any) {
	
}

export function removeListener(event: string, listener: any) {
	
}

export function removeAllListeners(event: string, listener: any) {
	
}

export function listeners(event: string) {
	
}

export function emit(event: string, ...args: any[]) {
	
}