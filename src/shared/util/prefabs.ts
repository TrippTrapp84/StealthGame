import { makeInstance } from "./instances";
import { compute } from "./compute";

const prefabs = {
	RootModel: compute(() => {
		const model = makeInstance("Model");
		const part = makeInstance("Part", model);
		model.PrimaryPart = part;

		return model as Model & { PrimaryPart: typeof part };
	}),
	PlayerCharacter: compute(() => {
		const model = makeInstance("Model");

		const part = makeInstance("Part", model);
		model.PrimaryPart = part;

		const hitbox = makeInstance("Part", model);
		hitbox.Name = "Hitbox";
		hitbox.Shape = Enum.PartType.Cylinder;
		hitbox.CFrame = CFrame.fromMatrix(new Vector3(), Vector3.yAxis, Vector3.xAxis.mul(-1), Vector3.zAxis);
		hitbox.Size = new Vector3(8, 2, 2);

		return model as Model & {
			PrimaryPart: typeof part;
			Hitbox: typeof hitbox;
		};
	}),
	Character: compute(() => {
		const model = makeInstance("Model");
		const part = makeInstance("Part", model);
		model.PrimaryPart = part;

		part.Size = new Vector3(2, 10, 2);
		part.Transparency = 0;

		const attachment = makeInstance("Attachment", part);
		attachment.Name = "CenterAttachment";
		// const position = makeInstance("AlignPosition", model);
		// position.Name = "CharacterPosition";
		// const orientation = makeInstance("AlignOrientation", model);
		// orientation.Name = "CharacterOrientation";

		return model as Model & {
			PrimaryPart: typeof part;
			// CharacterPosition: typeof position;
			// CharacterOrientation: typeof orientation;
			CenterAttachment: typeof attachment;
		};
	}),
} satisfies Record<string, Instance>;

type Prefabs = typeof prefabs;

export function makePrefab<T extends keyof Prefabs, P extends Instance>(name: T, parent: P): Prefabs[T] & { Parent: P };
export function makePrefab<T extends keyof Prefabs>(name: T): Prefabs[T] & { Parent?: Instance };

export function makePrefab<T extends keyof Prefabs, P extends Instance>(name: T, parent?: P): Prefabs[T] {
	const prefab = prefabs[name].Clone();
	prefab.Parent = parent;

	return prefab as Prefabs[T];
}
