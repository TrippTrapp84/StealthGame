const memoResults = new Map<string, unknown>();

export function useMemoized<T extends defined>(id: string, callback: () => T): T {
	if (memoResults.get(id) === undefined) {
		memoResults.set(id, callback());
	}

	return memoResults.get(id) as T;
}
