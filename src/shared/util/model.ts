import { makeInstance } from "./instances";

export function setModelAnchored(model: Model, anchored: boolean): void {
	for (const part of model.GetDescendants().filter((v) => v.IsA("BasePart")) as Array<BasePart>) {
		part.Anchored = anchored;
	}
}

export function weldModel(model: Model, part0: BasePart): WeldConstraint | undefined {
	const part1 = model.PrimaryPart || model.FindFirstAncestorWhichIsA("BasePart");
	if (part1 === undefined) return;

	setModelAnchored(model, false);

	const weld = makeInstance("WeldConstraint", part0);
	weld.Part0 = part0;
	weld.Part1 = part1;
	weld.Enabled = true;

	return weld;
}
