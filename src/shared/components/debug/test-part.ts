import { makeComponent } from "shared/util/matter/component";
import { makeInstance } from "shared/util/instances";
import { makeWorldEntity } from "../base/world-entity";
import { Workspace } from "@rbxts/services";

export interface DebugTestPart {}

export const DebugTestPart = makeComponent<DebugTestPart>("DebugTestPart");

export function makeDebugTestPart() {
	const [worldEntity] = makeWorldEntity(Workspace.DEBUG);

	worldEntity.root.Transparency = 0;
	worldEntity.root.Color = new Color3(1, 0, 0);

	return [worldEntity, DebugTestPart()] as const;
}
