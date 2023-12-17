export function compute<T>(exec: () => T): T {
	return exec();
}
