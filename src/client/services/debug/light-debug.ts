import { World } from "@rbxts/matter";
import { WorldEntity } from "shared/components/base/world-entity";
import { DebugLightVisualization } from "shared/components/debug/light-visualize";
import { DetectionLight } from "shared/components/detection-light";
import { makeInstance } from "shared/util/instances";
import { useWorld } from "shared/util/matter/start";
import { ClientParams, ClientService } from "types/generic";

export default class LightDebugService implements ClientService {
	/** @hidden */
	public onInit(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onStart(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onRender(world: World, [state]: ClientParams): void {
		for (const [entity, worldEntity, detectionLight, debugLightVisualization] of world.query(
			WorldEntity,
			DetectionLight,
			DebugLightVisualization,
		)) {
			if (detectionLight.light.IsA("SpotLight")) {
				this.updateSpotLight(entity);
			} else if (detectionLight.light.IsA("PointLight")) {
				this.updatePointLight(entity);
			} else if (detectionLight.light.IsA("SurfaceLight")) {
				this.updateSurfaceLight(entity);
			}
		}
	}

	/** @hidden */
	public onPhysics(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onHeartbeat(world: World, [state]: ClientParams): void {}

	private updateSpotLight(entity: number): void {
		// const world = useWorld();
		// const worldEntity = world.get(entity, WorldEntity);
		// const detectionLight = world.get(entity, DetectionLight);
		// const debugLightVisualization = world.get(entity, DebugLightVisualization);
		// const light = detectionLight.light as SpotLight;
		// const root = worldEntity.root;
		// const rootCF = root.CFrame;
		// const wedge1 = debugLightVisualization.parts.get("SpotLightWedge1") ?? makeInstance("CornerWedgePart");
		// const wedge2 = debugLightVisualization.parts.get("SpotLightWedge2") ?? makeInstance("CornerWedgePart");
		// const wedge3 = debugLightVisualization.parts.get("SpotLightWedge3") ?? makeInstance("CornerWedgePart");
		// const wedge4 = debugLightVisualization.parts.get("SpotLightWedge4") ?? makeInstance("CornerWedgePart");
		// debugLightVisualization.parts.set("SpotLightWedge1", wedge1);
		// debugLightVisualization.parts.set("SpotLightWedge2", wedge2);
		// debugLightVisualization.parts.set("SpotLightWedge3", wedge3);
		// debugLightVisualization.parts.set("SpotLightWedge4", wedge4);
		// const direction = worldEntity.root.CFrame.VectorToWorldSpace(Vector3.FromNormalId(light.Face));
		// const offset = direction.mul(light.Range);
		// let basis1: Vector3;
		// let basis2: Vector3;
		// if (math.abs(rootCF.XVector.Dot(direction)) > 0.1) {
		// 	basis1 = rootCF.YVector;
		// 	basis2 = rootCF.ZVector;
		// } else if (math.abs(rootCF.YVector.Dot(direction)) > 0.1) {
		// 	basis1 = rootCF.XVector;
		// 	basis2 = rootCF.ZVector;
		// } else {
		// 	basis1 = rootCF.XVector;
		// 	basis2 = rootCF.YVector;
		// }
		// const endSize = light.Range * math.tan(math.rad(light.Angle) / 2);
		// wedge1.Size = new Vector3(endSize, light.Range, endSize);
		// wedge2.Size = new Vector3(endSize, light.Range, endSize);
		// wedge3.Size = new Vector3(endSize, light.Range, endSize);
		// wedge4.Size = new Vector3(endSize, light.Range, endSize);
		// wedge1.CFrame = CFrame.fromMatrix(
		// 	rootCF.Position.add(offset)
		// 		.add(basis1.mul(endSize / 2))
		// 		.add(basis2.mul(endSize / 2)),
		// 	basis1,
		// 	basis2.mul(-1),
		// );
		// wedge2.CFrame = CFrame.fromMatrix(
		// 	rootCF.Position.add(offset)
		// 		.add(basis1.mul(endSize / 2))
		// 		.add(basis2.mul(endSize / 2)),
		// 	basis1,
		// 	basis2.mul(-1),
		// );
		// wedge3.CFrame = CFrame.fromMatrix(
		// 	rootCF.Position.add(offset)
		// 		.add(basis1.mul(endSize / 2))
		// 		.add(basis2.mul(endSize / 2)),
		// 	basis1,
		// 	basis2.mul(-1),
		// );
		// wedge4.CFrame = CFrame.fromMatrix(
		// 	rootCF.Position.add(offset)
		// 		.add(basis1.mul(endSize / 2))
		// 		.add(basis2.mul(endSize / 2)),
		// 	basis1,
		// 	basis2.mul(-1),
		// );
	}
	private updatePointLight(entity: number): void {}
	private updateSurfaceLight(entity: number): void {}
}
