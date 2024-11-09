import { Component, Entity, None, World } from "@rbxts/matter";
import { lerp } from "@rbxts/pretty-react-hooks";
import { Workspace } from "@rbxts/services";
import { ClientNPC, makeClientNPC } from "client/components/npc/client-npc";
import { Events } from "client/network";
import { EAssets, requestAsset } from "client/util/assets";
import { ServerNPC } from "shared/components/base/server-npc";
import { WorldEntity } from "shared/components/base/world-entity";
import { makeInstance } from "shared/util/instances";
import { useWorld } from "shared/util/matter/start";
import { weldModel } from "shared/util/model";
import { ClientParams, ClientService } from "types/generic";

type ClientNPCEntity = Entity<[Component<WorldEntity>, Component<ClientNPC>, Component<ServerNPC>]>;

export default class NPCService implements ClientService {
	/** @hidden */
	public onInit(world: World, [state]: ClientParams): void {
		Events.simpleGuardSpawned.connect((id, agent, config) => {
			const [worldEntity, clientNPC] = makeClientNPC();
			print("SIMPLE CONFIG", config);

			if (config.Light) {
				const light = makeInstance("SpotLight", clientNPC.character.PrimaryPart);
				light.Angle = 15;
				light.Range = 50;
				light.Brightness = 0.1;
				light.Shadows = true;

				const lightCone = requestAsset(EAssets.FlashlightCone)?.Clone();
				if (lightCone !== undefined) {
					lightCone.PivotTo(clientNPC.character.PrimaryPart.CFrame);
					weldModel(lightCone, clientNPC.character.PrimaryPart);
					lightCone.Parent = clientNPC.character;
				}
			}

			clientNPC.character.Parent = Workspace.Agents;

			world.spawn(worldEntity, clientNPC, ServerNPC({ id: id as never, agent, owner: None }));
		});
	}

	/** @hidden */
	public onStart(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onRender(world: World, [state]: ClientParams): void {
		for (const [entity] of world.query(WorldEntity, ClientNPC, ServerNPC)) {
			this.updateClientNPC(entity);
		}
	}

	/** @hidden */
	public onPhysics(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onHeartbeat(world: World, [state]: ClientParams): void {}

	private updateClientNPC(entity: ClientNPCEntity): void {
		const world = useWorld();

		const clientNPC = world.get(entity, ClientNPC);
		const serverNPC = world.get(entity, ServerNPC);

		const root = clientNPC.character.PrimaryPart;

		root.CFrame = root.CFrame.Rotation.add(serverNPC.agent.PrimaryPart.Position);

		root.CFrame = root.CFrame.Lerp(serverNPC.agent.PrimaryPart.CFrame, 0.5);
	}
}
