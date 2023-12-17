export function getRand<T>(arr: Array<T>): T | undefined {
	if (arr.isEmpty()) return;

	return arr[math.random(0, arr.size())];
}
