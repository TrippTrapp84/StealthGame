import { World } from "@rbxts/matter";
import { SimpleGuard, querySimpleGuard } from "shared/components/agents/simple-guard";
import { Agent } from "shared/components/base/agent";
import { HumanNPC } from "shared/components/base/human-npc";
import { AgentPathfinding, EPathfindingState } from "shared/components/base/pathfinding";
import { makeQuery } from "shared/util/matter/query";
import { ServerParams, ServerService } from "types/generic";
import ServerLevelService from "../level";
import { dependency } from "shared/util/matter/start";
import Object from "@rbxts/object-utils";
import { EServicePriority } from "types/matter/service";
import { WorldEntity } from "shared/components/base/world-entity";
import { getRand } from "shared/util/array";

export default class SimpleGuardService implements ServerService {
	public priority = EServicePriority.Primary;

	private levelService!: ServerLevelService;

	/** @hidden */
	public onInit(args_0: World, args_1: ServerParams): void {
		this.levelService = dependency(ServerLevelService);
	}

	/** @hidden */
	public onHeartbeat(world: World, [state]: ServerParams): void {
		for (const [entity, worldEntity, agent, pathfind, humanNPC, simpleGuard] of world.query(
			WorldEntity,
			Agent,
			AgentPathfinding,
			HumanNPC,
			SimpleGuard,
		)) {
			const levelNodes = this.levelService.getLevel()?.nodes;
			if (levelNodes === undefined) return;

			print("Updating simple guard", simpleGuard.node, Object.keys(levelNodes)[0]);
			if (simpleGuard.node === undefined) {
				world.insert(entity, simpleGuard.patch({ node: Object.keys(levelNodes)[0] }));
				continue;
			}

			if (pathfind.state === EPathfindingState.Idle) {
				print("Updating simple guard idle");
				const node = simpleGuard.node ?? Object.keys(levelNodes)[0];
				const nextNode = getRand(Object.keys(levelNodes.get(node) ?? new Set<BasePart>()));
				if (nextNode === undefined) return;

				print("Updating simple guard idle nextNode", nextNode);
				world.insert(entity, simpleGuard.patch({ node: nextNode }));

				world.insert(entity, pathfind.patch({ target: nextNode }));
			}
		}
	}
}
