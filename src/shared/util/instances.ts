type InstanceList = {
	[Key in keyof CreatableInstances]?: Partial<WritableProperties<CreatableInstances[Key]>>;
};

const props: InstanceList = {
	Part: {
		Size: Vector3.one,
		Anchored: true,
		CanCollide: false,
		Transparency: 1,
		CanTouch: false,
		Massless: true,
		CanQuery: false,
		CFrame: new CFrame(),
	},

	AlignPosition: {
		Mode: Enum.PositionAlignmentMode.OneAttachment,
		Position: Vector3.zero,
		ReactionForceEnabled: false,
		ApplyAtCenterOfMass: true,
		ForceRelativeTo: Enum.ActuatorRelativeTo.World,
		Responsiveness: 100,
		RigidityEnabled: true,
	},

	AlignOrientation: {
		Mode: Enum.OrientationAlignmentMode.OneAttachment,
		CFrame: new CFrame(),
		ReactionTorqueEnabled: false,
		AlignType: Enum.AlignType.AllAxes,
		Responsiveness: 100,
		RigidityEnabled: true,
	},
	CornerWedgePart: {
		Size: Vector3.one,
		Anchored: true,
		CanCollide: false,
		Transparency: 1,
		CanTouch: false,
		Massless: true,
		CanQuery: false,
		CFrame: new CFrame(),
	},
	PointLight: {
		Brightness: 0,
		Range: 0,
		Shadows: false,
		Color: new Color3(1, 1, 1),
		Enabled: true,
	},
	SpotLight: {
		Brightness: 0,
		Range: 0,
		Angle: 0,
		Shadows: false,
		Color: new Color3(1, 1, 1),
		Enabled: true,
		Face: Enum.NormalId.Front,
	},
} as const;

const instances: { [Key in keyof CreatableInstances]?: CreatableInstances[Key] } = {};

for (const [className, propList] of pairs(props)) {
	const obj = new Instance(className);
	for (const [prop, value] of pairs(propList)) {
		obj[prop] = value as never;
	}

	instances[className] = obj as never;
}

export function makeInstance<I extends keyof CreatableInstances, P extends Instance>(
	name: I,
	parent: P,
): CreatableInstances[I] & { Parent: P };

export function makeInstance<I extends keyof CreatableInstances>(
	name: I,
): CreatableInstances[I] & { Parent: undefined };

export function makeInstance<I extends keyof CreatableInstances>(
	name: I,
	parent?: Instance,
): CreatableInstances[I] & { Parent: typeof parent };

export function makeInstance<I extends keyof CreatableInstances, P extends Instance>(
	name: I,
	parent?: P,
): CreatableInstances[I] {
	const instance = instances[name]?.Clone() ?? new Instance(name);
	instance.Parent = parent;

	return instance as never;
}
