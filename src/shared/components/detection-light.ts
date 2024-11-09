import { makeComponent } from "shared/util/matter/component";
import { makeWorldEntity } from "./base/world-entity";
import { makeInstance } from "shared/util/instances";
import { RunService, Workspace } from "@rbxts/services";
import { DebugLightVisualization } from "./debug/light-visualize";

export interface DetectionLight {
	light: Light;
}

export const DetectionLight = makeComponent<DetectionLight>("DetectionLight");

export function makeDetectionLight(light?: Light) {
	const [worldEntity] = makeWorldEntity(Workspace);

	const detectionLight = light ?? makeInstance("SpotLight");
	detectionLight.Parent = worldEntity.root;

	return [worldEntity, DetectionLight({ light: detectionLight })] as const;
}
