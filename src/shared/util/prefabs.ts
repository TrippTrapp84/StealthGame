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

		const attachment = makeInstance("Attachment", part);
		attachment.Name = "Attachment0";
		const position = makeInstance("AlignPosition", model);
		position.Name = "CharacterPosition";
		const orientation = makeInstance("AlignOrientation", model);
		orientation.Name = "CharacterOrientation";

		return model as Model & {
			PrimaryPart: typeof part;
			CharacterPosition: typeof position;
			CharacterOrientation: typeof orientation;
			Attachment0: typeof attachment;
		};
	}),
} as const;

type Prefabs = typeof prefabs;

export function makePrefab<T extends keyof Prefabs, P extends Instance>(name: T, parent: P): Prefabs[T] & { Parent: P };
export function makePrefab<T extends keyof Prefabs>(name: T): Prefabs[T] & { Parent: undefined };

export function makePrefab<T extends keyof Prefabs, P extends Instance>(name: T, parent?: P): Prefabs[T] {
	const prefab = prefabs[name].Clone();
	prefab.Parent = parent;

	return prefab as Prefabs[T];
}
