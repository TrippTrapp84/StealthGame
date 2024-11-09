import { World } from "@rbxts/matter";
import { WorldEntity } from "shared/components/base/world-entity";
import { DetectionLight } from "shared/components/detection-light";
import { DebugTestPart } from "shared/components/debug/test-part";
import { isPointInLight } from "shared/util/lights";
import { ClientParams, ClientService } from "types/generic";

export default class DetectionService implements ClientService {
	/** @hidden */
	public onInit(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onStart(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onRender(world: World, [state]: ClientParams): void {
		const lights = world.query(WorldEntity, DetectionLight).snapshot();
		for (const [entity, worldEntity, debugTestPart] of world.query(WorldEntity, DebugTestPart)) {
			for (const [_i, [_lightEntity, lightWorldEntity, lightDetectionLight]] of pairs(lights)) {
				const isInLight = isPointInLight(
					lightDetectionLight.light,
					lightWorldEntity.root,
					worldEntity.root.Position,
				);
				if (isInLight) {
					worldEntity.root.Color = new Color3(1, 1, 1);
					return;
				} else {
					worldEntity.root.Color = new Color3(0, 0, 0);
				}
			}
		}
	}

	/** @hidden */
	public onPhysics(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onHeartbeat(world: World, [state]: ClientParams): void {}
}
