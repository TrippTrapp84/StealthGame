import { None, World, useEvent } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { Events } from "server/network";
import { makeSimpleGuard } from "shared/components/agents/simple-guard";
import { PlayerCharacter } from "shared/components/replicated/player-character";
import { EntityId } from "types/matter/world";

export enum ESpawners {
	SimpleGuard = "SimpleGuard",
	Players = "Players",
}

export const Spawners = {
	[ESpawners.SimpleGuard]: (world: World, spawner: Part) => {
		const components = makeSimpleGuard();
		const [worldEntity, agent] = components;
		agent.model.PivotTo(spawner.CFrame);

		return world.spawn(...components);
	},

	[ESpawners.Players]: (world: World, spawner: Part) => {
		Events.characterSpawned.broadcast();
		return world.spawn(PlayerCharacter({ id: `PlayerCharacter_${Players.GetPlayers()[0].UserId}`, owner: None }));
	},
} satisfies Record<ESpawners, (world: World, spawner: Part) => EntityId>;
