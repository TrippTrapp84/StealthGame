import { None } from "@rbxts/matter";

export function isNone(value: unknown): value is None {
	return value === None || value === undefined;
}
