import { Component, component } from "@rbxts/matter";
import { makeComponent } from "./component";

export const ReplicatedComponents = new Set<() => Component<object>>();

export function makeReplicatedComponent<T extends object = object>(
	name?: string,
	defaultData?: T,
	cleanup?: (comp: Component<T>) => void,
): ReturnType<typeof component<T>> {
	const comp = makeComponent(name, defaultData, cleanup);

	ReplicatedComponents.add(comp);

	return comp;
}
