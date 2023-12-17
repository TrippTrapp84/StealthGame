import { World } from "@rbxts/matter";
import { makeSimpleGuard } from "shared/components/agents/simple-guard";
import { EntityId } from "types/matter/world";

export enum ESpawners {
	SimpleGuard = "SimpleGuard",
}

export const Spawners: Record<ESpawners, (world: World, spawner: Part) => EntityId> = {
	[ESpawners.SimpleGuard]: (world: World, spawner: Part) => {
		const components = makeSimpleGuard();
		const [worldEntity, agent] = components;
		agent.model.PivotTo(spawner.CFrame);

		return world.spawn(...components);
	},
};
