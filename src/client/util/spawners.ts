import { AnyComponent, component, World } from "@rbxts/matter";
import { RunService, Workspace } from "@rbxts/services";
import { makeMainMenu } from "client/components/ui/main-menu";
import { makeDetectionLight } from "shared/components/detection-light";
import { makeDebugTestPart } from "shared/components/debug/test-part";
import { makeInstance } from "shared/util/instances";
import { ESpawners } from "types/enums/spawners";
import { EntityId } from "types/matter/world";
import { DebugLightVisualization } from "shared/components/debug/light-visualize";

type SpawnersRecord = Partial<Record<ESpawners, (world: World, spawner: Part) => EntityId | undefined>>;

const _Spawners = {
	[ESpawners.MainMenu]: (world: World, spawner: Part) => {
		return world.spawn(...makeMainMenu());
	},
	[ESpawners.DetectionLight]: (world: World, spawner: Part) => {
		const light = makeInstance("PointLight");

		const components = makeDetectionLight(light);
		const [worldEntity, detectionLight] = components;

		worldEntity.root.CFrame = spawner.CFrame;

		const finalComps: Array<AnyComponent> = [...components];
		if (RunService.IsStudio()) finalComps.push(DebugLightVisualization());
		return world.spawn(...finalComps);
	},
	[ESpawners.DebugTestPart]: (world: World, spawner: Part) => {
		if (!RunService.IsStudio()) return;

		const components = makeDebugTestPart();
		const [worldEntity] = components;

		worldEntity.root.CFrame = spawner.CFrame;

		return world.spawn(...components);
	},
} satisfies SpawnersRecord;

export const Spawners = _Spawners as SpawnersRecord;
