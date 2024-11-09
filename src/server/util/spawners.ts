import { AnyComponent, None, World, useEvent } from "@rbxts/matter";
import { Players, RunService, ServerStorage } from "@rbxts/services";
import { Events } from "server/network";
import { makeSimpleGuard } from "shared/components/agents/simple-guard";
import { PlayerCharacter } from "shared/components/replicated/player-character";
import { getConfiguration } from "shared/util/configuration";
import { makeInstance } from "shared/util/instances";
import { setModelAnchored, weldModel } from "shared/util/model";
import { EPathLabels } from "types/enums/path-labels";
import { ESpawners } from "types/enums/spawners";
import { EntityId } from "types/matter/world";

type SpawnersRecord = Partial<Record<ESpawners, (world: World, spawner: Part) => EntityId | undefined>>;

const _Spawners = {
	[ESpawners.SimpleGuard]: (world: World, spawner: Part) => {
		let [worldEntity, agent, serverNPC, detectionMeter, pathfinding, simpleGuard] = makeSimpleGuard();
		agent.model.PivotTo(spawner.CFrame);

		const config = getConfiguration<SimpleGuardConfig>(spawner);

		if (config.Node !== undefined) {
			pathfinding = pathfinding.patch({ target: config.Node });
			simpleGuard = simpleGuard.patch({ node: config.Node });
		}

		// if (config.Light) {
		// 	const light = makeInstance("SpotLight", serverNPC.character.PrimaryPart);
		// 	light.Angle = 15;
		// 	light.Range = 50;
		// 	light.Brightness = 0.1;
		// 	light.Shadows = true;

		// 	const lightCone = ServerStorage.Assets.Models.FlashlightCone.Clone();
		// 	lightCone.PivotTo(serverNPC.character.PrimaryPart.CFrame);
		// 	weldModel(lightCone, serverNPC.character.PrimaryPart);
		// 	lightCone.Parent = serverNPC.character;
		// }

		const finalComps: Array<AnyComponent> = [
			worldEntity,
			agent,
			serverNPC,
			detectionMeter,
			pathfinding,
			simpleGuard,
		];

		if (RunService.IsStudio()) {
			agent.model.PrimaryPart.Transparency = 0;
			// pathfinding = pathfinding.patch({ speed: 20 });
		}

		Events.simpleGuardSpawned.broadcast(serverNPC.id, serverNPC.agent, config);

		return world.spawn(worldEntity, agent, serverNPC, detectionMeter, pathfinding, simpleGuard);
	},

	[ESpawners.Player]: (world: World, spawner: Part) => {
		let player = Players.GetPlayers()[0];
		if (player === undefined) {
			player = Players.PlayerAdded.Wait()[0];
		}

		Events.characterSpawned.broadcast(spawner.Position);
		return world.spawn(
			PlayerCharacter({
				id: `PlayerCharacter_${player.UserId}`,
				owner: player.UserId,
			}),
		);
	},
} satisfies SpawnersRecord;

export const Spawners = _Spawners as SpawnersRecord;
