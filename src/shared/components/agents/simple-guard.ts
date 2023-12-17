import { component } from "@rbxts/matter";
import { makePrefab } from "shared/util/prefabs";
import { WorldEntity } from "../base/world-entity";
import { Agent, makeAgent } from "../base/agent";
import { AgentPathfinding, EPathfindingState } from "../base/pathfinding";
import { PathfindingService } from "@rbxts/services";
import { PathLabelCosts, PathMaterialCosts } from "shared/meta/path-costs";
import { HumanNPC, makeHumanNPC } from "../base/human-npc";
import { QueryResult, World } from "@rbxts/matter/lib/World";
import { makeComponent } from "shared/util/matter/component";
import { makeQuery } from "shared/util/matter/query";
import { ComponentCtor } from "@rbxts/matter/lib/component";

export interface SimpleGuard {
	lastUpdate: number;
	node?: BasePart;
}

export const SimpleGuard = makeComponent<SimpleGuard>("Agent", { lastUpdate: tick() });

export function makeSimpleGuard() {
	const [worldEntity, agent, humanNPC] = makeHumanNPC();
	return [
		worldEntity,
		agent,
		humanNPC,
		AgentPathfinding({
			state: EPathfindingState.Idle,
			path: PathfindingService.CreatePath({
				Costs: { ...PathLabelCosts, ...PathMaterialCosts },
				AgentHeight: 5,
				AgentCanJump: false,
				AgentRadius: 2,
				WaypointSpacing: 1,
			}),
			speed: 1,
		}),
		SimpleGuard(),
	] as const;
}

export function querySimpleGuard<const R extends ComponentCtor[]>(world: World, query: R) {
	return makeQuery(world, [WorldEntity, Agent, HumanNPC, AgentPathfinding, SimpleGuard], query);
}
