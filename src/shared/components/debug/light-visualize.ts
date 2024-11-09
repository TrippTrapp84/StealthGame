import { makeComponent } from "shared/util/matter/component";
import { makeInstance } from "shared/util/instances";
import { makeWorldEntity } from "../base/world-entity";
import { Workspace } from "@rbxts/services";

export interface DebugLightVisualization {
	parts: Map<string, BasePart>;
}

export const DebugLightVisualization = makeComponent<DebugLightVisualization>("DebugLightVisualization", {
	parts: new Map(),
});
