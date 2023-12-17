import { Component, World, useEvent } from "@rbxts/matter";
import { dependency } from "shared/util/matter/start";
import { ServerParams, ServerService } from "types/generic";
import ServerLevelService from "./level";
import { AgentPathfinding, EPathfindingState } from "shared/components/base/pathfinding";
import { Agent } from "shared/components/base/agent";
import { QueryResult } from "@rbxts/matter/lib/World";
import { EntityId } from "types/matter/world";
import { EServicePriority } from "types/matter/service";
import { SimpleGuard } from "shared/components/agents/simple-guard";

export default class ServerPathfindingService implements ServerService {
	public priority = EServicePriority.Quaternary;

	private levelService!: ServerLevelService;

	public onInit(world: World, [state]: ServerParams): void {
		this.levelService = dependency(ServerLevelService);

		useEvent();
	}

	public onStart(world: World, [state]: ServerParams): void {}

	public onRender(world: World, [state]: ServerParams): void {}

	public onPhysics(world: World, [state]: ServerParams): void {}

	public onHeartbeat(world: World, [state]: ServerParams): void {
		const agents = world.query(Agent, AgentPathfinding);

		for (const [entity, agent, pathfind] of agents) {
			print("Updating pathfinding for", entity);
			this.updatePathfinding(world, entity, agent, pathfind, state.dt);
		}
	}

	private updatePathfinding(
		world: World,
		entity: EntityId,
		agent: Component<Agent>,
		pathfind: Component<AgentPathfinding>,
		dt: number,
	): void {
		if (pathfind.state === EPathfindingState.Idle) {
			this.updateIdle(world, entity, agent, pathfind);
		} else if (pathfind.state === EPathfindingState.Active) {
			this.updateActive(world, entity, agent, pathfind, dt);
		} else if (pathfind.state === EPathfindingState.Computing) {
		}
	}

	private updateActive(
		world: World,
		entity: EntityId,
		agent: Component<Agent>,
		pathfind: Component<AgentPathfinding>,
		dt: number,
	): void {
		const waypoints = pathfind.path.GetWaypoints();
		const current = pathfind.waypoint ?? 0;

		const model = agent.model;

		if (pathfind.waypoint === undefined) {
			pathfind = pathfind.patch({ waypoint: current });
		}

		const waypoint = waypoints[current];
		if (waypoint === undefined) {
			world.insert(entity, pathfind.patch({ state: EPathfindingState.Idle }));
			return;
		}

		const offset = waypoint.Position.sub(model.PrimaryPart.Position);
		if (offset.Magnitude < 0.5) {
			world.insert(entity, pathfind.patch({ waypoint: current + 1 }));
			this.updateActive(world, entity, agent, pathfind, dt);
			return;
		}

		model.PivotTo(
			CFrame.lookAt(
				model.PrimaryPart.Position.add(offset.Unit.mul(math.min(dt * pathfind.speed, offset.Magnitude))),
				waypoint.Position.add(offset.Unit),
			),
		);
	}

	private updateIdle(
		world: World,
		entity: EntityId,
		agent: Component<Agent>,
		pathfind: Component<AgentPathfinding>,
	): void {
		const waypoints = pathfind.path.GetWaypoints();
		const last = waypoints.pop();

		print("Updating idle", pathfind);

		const target = pathfind.target;

		if (target === undefined || (last && target.Position.sub(last.Position).Magnitude < 0.5)) return;

		task.spawn(() => {
			pathfind.path.ComputeAsync(agent.model.PrimaryPart.Position, target.Position);
		});
		world.insert(entity, pathfind.patch({ state: EPathfindingState.Computing, waypoint: 0 }));
	}
}
