import { Component, None, World } from "@rbxts/matter";
import Object from "@rbxts/object-utils";
import { Players } from "@rbxts/services";
import { Events } from "server/network";
import { PlayerCharacter } from "shared/components/replicated/player-character";
import { ReplicatedComponents } from "shared/util/matter/replication";
import { ServerParams, ServerService } from "types/generic";
import { EServicePriority } from "types/matter/service";

export default class ServerReplicationService implements ServerService {
	public priority = EServicePriority.Last;

	public onInit(world: World, [state]: ServerParams): void {
		Events.replicationChanged.connect((player, id, data) => {
			const replicated = Object.keys(ReplicatedComponents);

			for (const comp of replicated) {
				for (const [entity, repComp] of world.query(comp)) {
					if (repComp.id === id && repComp.owner === player.UserId) {
						world.insert(entity, repComp.patch(data));
					}
				}
			}
		});
	}

	public onHeartbeat(world: World, [state]: ServerParams): void {
		const replicated = Object.keys(ReplicatedComponents);

		for (const comp of replicated) {
			for (const [entity, { old, new: latest }] of world.queryChanged(comp)) {
				if (latest === undefined) {
					Events.replicationRemoved.broadcast(old!.id, old!);
				} else if (old === undefined) {
					Events.replicationAdded.broadcast(latest!.id, latest!);
				} else {
					const owner = [
						Players.GetPlayerByUserId(latest.owner !== None ? (latest.owner as number) : 0),
					] as Array<Player>;
					Events.replicationChanged.except(owner, latest.id, latest);
				}
			}
		}
	}
}
