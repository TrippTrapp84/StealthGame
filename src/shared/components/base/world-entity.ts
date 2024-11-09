import { component } from "@rbxts/matter";
import { makeInstance } from "shared/util/instances";
import { makeComponent } from "shared/util/matter/component";

export interface WorldEntity {
	root: BasePart;
}

export const WorldEntity = makeComponent<WorldEntity>("Entity");

export function makeWorldEntity(parent?: Instance) {
	return [WorldEntity({ root: makeInstance("Part", parent) })] as const;
}
