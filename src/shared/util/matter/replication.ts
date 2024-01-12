import { Component, None, component } from "@rbxts/matter";
import { makeComponent } from "./component";

interface ReplicatedBase {
	id: string;
	owner: None | UserId;
}

export const ReplicatedComponents = new Set<() => Component<ReplicatedBase>>();

export function makeReplicatedComponent<T extends ReplicatedBase = ReplicatedBase>(
	name?: string,
	defaultData?: T,
	cleanup?: (comp: Component<T>) => void,
): ReturnType<typeof component<T>> {
	const comp = makeComponent(name, defaultData, cleanup);

	ReplicatedComponents.add(comp);

	return comp;
}
