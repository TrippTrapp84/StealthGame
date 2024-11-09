import { Component, component, None } from "@rbxts/matter";
import { ComponentCtor } from "@rbxts/matter/lib/component";

export const CleanupComponents = new Map<ComponentCtor, (comp: Component<object>) => void>();

// export function makeComponent<T extends Partial<Record<string, never>>>(
// 	name: string | undefined,
// 	defaultData?: undefined,
// 	cleanup?: (comp: Component<T>) => void,
// ): (data?: T) => Component<T>;

// export function makeComponent<T extends object>(
// 	name: string | undefined,
// 	defaultData?: undefined,
// 	cleanup?: (comp: Component<T>) => void,
// ): (data: T) => Component<T>;

// export function makeComponent<T extends object>(
// 	name: string | undefined,
// 	defaultData: T,
// 	cleanup?: (comp: Component<T>) => void,
// ): ReturnType<typeof component<T>>;

export function makeComponent<T extends Record<keyof T, defined | None>>(
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
