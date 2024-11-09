import { makeComponent } from "shared/util/matter/component";
import { makeWorldEntity } from "../base/world-entity";
import { makeInstance } from "shared/util/instances";
import { RunService, Workspace } from "@rbxts/services";
import { DebugLightVisualization } from "../debug/light-visualize";

export interface DetectionMeter {
	detection: number;
}

export const DetectionMeter = makeComponent<DetectionMeter>("DetectionMeter");

export function makeDetectionMeter() {
	return [DetectionMeter({ detection: 0 })] as const;
}
