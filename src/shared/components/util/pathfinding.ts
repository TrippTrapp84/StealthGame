import { component, Entity, None } from "@rbxts/matter";
import { makeComponent } from "shared/util/matter/component";
import { PathInstance } from "shared/util/path";
import { EntityId } from "types/matter/world";
import { Agent } from "../base/agent";

export const enum EPathfindingState {
	/**
	 * This agent is not currently attempting to pathfind, possibly because it has no target,
	 * no computed path, or is finished with its previous path.
	 */
	Idle,

	/**
	 * The agent is currently pathfinding, there are no known obstructions, and we have a valid target
	 */
	Active,

	/**
	 * The agent has a valid target but the current path has an obstruction
	 */
	Blocked,

	/**
	 * The agent's path is still being computed. This state may last a few frames,
	 * but will eventually resolve
	 */
	Computing,

	/**
	 * The agent is currently in an unknown state, and pathfinding is deemed impossible.\
	 * Leaving this state requires critical action that does not follow normal pathfinding logic.
	 */
	Stuck,

	/**
	 * Must be triggered manually, will disable the pathfinding and movement functionality
	 * for the duration this state is active.
	 */
	Disabled,
}

export interface AgentPathfinding {
	path: PathInstance;
	state: EPathfindingState;

	speed: number;
	radius: number;
	height: number;

	target: { Position: Vector3 } | None;
	waypoint: number | None;
}

export const AgentPathfinding = makeComponent<AgentPathfinding>("AgentPathfinding");
