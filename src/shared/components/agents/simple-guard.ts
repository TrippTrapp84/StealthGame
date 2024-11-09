import { None, component } from "@rbxts/matter";
import { makePrefab } from "shared/util/prefabs";
import { WorldEntity } from "../base/world-entity";
import { Agent, makeAgent } from "../base/agent";
import { AgentPathfinding, EPathfindingState } from "../util/pathfinding";
import { PathfindingService } from "@rbxts/services";
import { PathLabelCosts, PathMaterialCosts } from "shared/meta/path-costs";
import { ServerNPC, makeServerNPC } from "../base/server-npc";
import { Entity, QueryResult, World } from "@rbxts/matter/lib/World";
import { makeComponent } from "shared/util/matter/component";
import { makeQuery } from "shared/util/matter/query";
import { ComponentCtor } from "@rbxts/matter/lib/component";
import { PathInstance } from "shared/util/path";
import { EAIStates } from "types/enums/ai-state";
import { Component } from "@rbxts/matter";
import { DetectionMeter, makeDetectionMeter } from "../util/detection-meter";
import { useWorld } from "shared/util/matter/start";

export interface SimpleGuard {
	/**
	 * The last time this guard was updated by a service
	 */
	lastUpdate: number;
	stateStartTime: number;

	node: BasePart | None;
	disturbances: Array<number>;

	state: EAIStates;
	stateDuration: number | None;

	lastOccupiedTime: number;
}

export type SimpleGuardEntity = Entity<
	[
		Component<WorldEntity>,
		Component<Agent>,
		Component<ServerNPC>,
		Component<DetectionMeter>,
		Component<AgentPathfinding>,
		Component<SimpleGuard>,
	]
>;

export const SimpleGuard = makeComponent<SimpleGuard>("SimpleGuard", {
	lastUpdate: tick(),
	stateStartTime: tick(),
	state: EAIStates.Idle,
	node: None,
	disturbances: [],
	stateDuration: 0,
	lastOccupiedTime: tick(),
});

export function makeSimpleGuard() {
	const [worldEntity, agent, serverNPC] = makeServerNPC();
	return [
		worldEntity,
		agent,
		serverNPC,
		...makeDetectionMeter(),
		AgentPathfinding({
			state: EPathfindingState.Idle,
			path: new PathInstance({
				Costs: { ...PathLabelCosts, ...PathMaterialCosts },
				AgentHeight: 12,
				AgentCanJump: false,
				AgentRadius: 2,
				WaypointSpacing: 1,
			}),
			target: None,
			waypoint: None,
			height: 12,
			radius: 2,
			speed: 5,
		}),
		SimpleGuard(),
	] as const;
}

export function querySimpleGuard<const R extends ComponentCtor[]>() {
	const world = useWorld();

	return makeQuery(world, [WorldEntity, Agent, ServerNPC, DetectionMeter, AgentPathfinding, SimpleGuard]);
}
