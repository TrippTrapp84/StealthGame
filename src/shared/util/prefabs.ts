import { makeInstance } from "./instances";
import { compute } from "./compute";

const prefabs = {
	RootModel: compute(() => {
		const model = makeInstance("Model");
		const part = makeInstance("Part", model);
		model.PrimaryPart = part;

		return model as Model & { PrimaryPart: typeof part };
	}),
	Character: compute(() => {
		const model = makeInstance("Model");
		const part = makeInstance("Part", model);
		model.PrimaryPart = part;

		return model as Model & { PrimaryPart: typeof part };
	}),
} as const;

type Prefabs = typeof prefabs;

export function makePrefab<T extends keyof typeof prefabs, P extends Instance>(
	name: T,
	parent: P,
): Prefabs[T] & { Parent: P };
export function makePrefab<T extends keyof typeof prefabs>(name: T): Prefabs[T] & { Parent: undefined };

export function makePrefab<T extends keyof typeof prefabs, P extends Instance>(name: T, parent?: P): Prefabs[T] {
	const prefab = prefabs[name].Clone();
	prefab.Parent = parent;

	print(prefab, prefab.PrimaryPart);

	return prefab;
}
