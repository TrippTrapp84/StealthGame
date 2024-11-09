import { Component, None, World, useDeltaTime, useEvent } from "@rbxts/matter";
import { dependency, useWorld } from "shared/util/matter/start";
import { ServerParams, ServerService } from "types/generic";
import ServerLevelService from "./level";
import { AgentPathfinding, EPathfindingState } from "shared/components/util/pathfinding";
import { Agent, AgentEntity } from "shared/components/base/agent";
import { Entity, QueryResult } from "@rbxts/matter/lib/World";
import { EntityId } from "types/matter/world";
import { EServicePriority } from "types/matter/service";
import { SimpleGuard } from "shared/components/agents/simple-guard";
import { EPathState } from "shared/util/path";
import { WorldEntity } from "shared/components/base/world-entity";
import { isNone } from "shared/util/matter/none";

type AgentPathfindingEntity = Entity<[Component<Agent>, Component<AgentPathfinding>]>;

export default class ServerPathfindingService implements ServerService {
	public priority = EServicePriority.Quaternary;

	private levelService!: ServerLevelService;

	public onInit(world: World, [state]: ServerParams): void {
		this.levelService = dependency(ServerLevelService);
	}

	public onStart(world: World, [state]: ServerParams): void {}

	public onRender(world: World, [state]: ServerParams): void {}

	public onPhysics(world: World, [state]: ServerParams): void {}

	public onHeartbeat(world: World, [state]: ServerParams): void {
		const agents = world.query(Agent, AgentPathfinding);

		for (const [entity, agent, pathfind] of agents) {
			this.updatePathfinding(entity, agent, pathfind, useDeltaTime());
		}
	}

	private updatePathfinding(
		entity: AgentPathfindingEntity,
		agent: Component<Agent>,
		pathfind: Component<AgentPathfinding>,
		dt: number,
	): void {
		if (pathfind.state === EPathfindingState.Idle) {
			this.updateIdle(entity, agent, pathfind);
		} else if (pathfind.state === EPathfindingState.Active) {
			this.updateActive(entity, agent, pathfind, dt);
		} else if (pathfind.state === EPathfindingState.Computing) {
			this.updateComputing(entity, agent, pathfind);
		} else if (pathfind.state === EPathfindingState.Disabled) {
			return;
		}
	}

	private updateActive(
		entity: AgentPathfindingEntity,
		agent: Component<Agent>,
		pathfind: Component<AgentPathfinding>,
		dt: number,
	): void {
		const world = useWorld();

		const waypoints = pathfind.path.getWaypoints();
		const current = isNone(pathfind.waypoint) ? 0 : pathfind.waypoint;

		const model = agent.model;

		if (isNone(pathfind.waypoint)) {
			pathfind = pathfind.patch({ waypoint: current });
		}

		const waypoint = waypoints[current];
		if (waypoint === undefined) {
			world.insert(entity, pathfind.patch({ state: EPathfindingState.Idle }));
			return;
		}

		const waypointLocation = this.getWaypointLocation(entity, waypoint);

		const offset = waypointLocation.sub(model.PrimaryPart.Position);
		if (offset.Magnitude < 0.5) {
			const newPathfind = pathfind.patch({ waypoint: current + 1 });
			world.insert(entity, newPathfind);
			this.updateActive(entity, agent, newPathfind, dt);
			return;
		}

		model.PivotTo(
			CFrame.lookAt(
				model.PrimaryPart.Position.add(offset.Unit.mul(math.min(dt * pathfind.speed, offset.Magnitude))),
				waypointLocation.add(offset.Unit),
			),
		);
	}

	private updateIdle(
		entity: AgentPathfindingEntity,
		agent: Component<Agent>,
		pathfind: Component<AgentPathfinding>,
	): void {
		const world = useWorld();

		const waypoints = pathfind.path.getWaypoints();
		const last = waypoints.pop();

		const target = pathfind.target;
		if (
			isNone(target) ||
			(last !== undefined && target.Position.sub(this.getWaypointLocation(entity, last)).Magnitude < 0.5)
		)
			return;

		pathfind.path.computeAsync(agent.model.PrimaryPart.Position, target.Position);
		world.insert(entity, pathfind.patch({ state: EPathfindingState.Computing, waypoint: 0 }));
	}

	private updateComputing(
		entity: AgentPathfindingEntity,
		agent: Component<Agent>,
		pathfind: Component<AgentPathfinding>,
	): void {
		const world = useWorld();

		if (pathfind.path.getStatus() === EPathState.NoPath) {
			world.insert(entity, pathfind.patch({ state: EPathfindingState.Idle, waypoint: 0 }));
		} else if (pathfind.path.getStatus() === EPathState.ValidPath) {
			world.insert(entity, pathfind.patch({ state: EPathfindingState.Active, waypoint: 0 }));
		}
	}

	private getWaypointLocation(entity: AgentPathfindingEntity, waypoint: PathWaypoint): Vector3 {
		const world = useWorld();

		const pathfinding = world.get(entity, AgentPathfinding);

		return waypoint.Position.add(new Vector3(0, pathfinding.height / 2));
	}
}
