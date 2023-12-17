import { Component, component } from "@rbxts/matter";
import { ComponentCtor } from "@rbxts/matter/lib/component";

export const CleanupComponents = new Map<ComponentCtor, (comp: Component<object>) => void>();

export function makeComponent<T extends object>(
	name?: string,
	defaultData?: T,
	cleanup?: (comp: Component<T>) => void,
): ReturnType<typeof component<T>> {
	const comp = component<T>(name, defaultData);

	if (cleanup !== undefined) {
		CleanupComponents.set(comp, cleanup as never);
	}

	return comp;
}
