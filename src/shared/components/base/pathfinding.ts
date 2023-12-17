import { component } from "@rbxts/matter";
import { makeComponent } from "shared/util/matter/component";

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

	Computing,

	/**
	 * The agent is currently in an unknown state, and pathfinding is deemed impossible.
	 * Leaving this state requires critical action that does not follow normal pathfinding logic.
	 */
	Stuck,
}

export interface AgentPathfinding {
	path: Path;
	state: EPathfindingState;

	speed: number;

	target?: { Position: Vector3 };
	waypoint?: number;
}

export const AgentPathfinding = makeComponent<AgentPathfinding>("AgentPathfinding");
