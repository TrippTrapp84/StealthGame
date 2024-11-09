export function promiseEvent<
	R extends unknown[],
	E extends {
		connect?(callback: (...args: R) => void): RBXScriptConnection;
		Connect?(callback: (...args: R) => void): RBXScriptConnection;
	},
>(event: E): Promise<R> {
	let res: (value: R | Promise<R>) => void;
	const promise = new Promise<R>((resolve) => (res = resolve));

	if ("connect" in event) {
		event.connect!((...args) => res(args));
	} else if ("Connect" in event) {
		event.Connect!((...args) => res(args));
	}

	return promise;
}
