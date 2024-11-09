import { Component, Entity, None, World } from "@rbxts/matter";
import { querySimpleGuard, SimpleGuard, SimpleGuardEntity } from "shared/components/agents/simple-guard";
import { Agent } from "shared/components/base/agent";
import { ServerNPC } from "shared/components/base/server-npc";
import { AgentPathfinding, EPathfindingState } from "shared/components/util/pathfinding";
import { makeQuery } from "shared/util/matter/query";
import { ServerParams, ServerService } from "types/generic";
import ServerLevelService from "../level";
import { dependency, useWorld } from "shared/util/matter/start";
import Object from "@rbxts/object-utils";
import { EServicePriority } from "types/matter/service";
import { WorldEntity } from "shared/components/base/world-entity";
import { getRand } from "shared/util/array";
import { EAIStates } from "types/enums/ai-state";
import { AdvancedSearchCall } from "shared/components/alerts/advanced-search-call";
import { Disturbance, DisturbanceEntity, queryDisturbance } from "shared/components/alerts/disturbance";
import { newComponent } from "@rbxts/matter/lib/component";
import { isNone } from "shared/util/matter/none";
import { DetectionMeter } from "shared/components/util/detection-meter";
import { walkUpBindingElementsAndPatterns } from "typescript";
import { flatLookAt } from "shared/util/cframe";

export default class SimpleGuardService implements ServerService {
	public priority = EServicePriority.Primary;

	private usedNodes = new Set<BasePart>();

	private levelService!: ServerLevelService;

	/** @hidden */
	public onInit(world: World, [state]: ServerParams): void {
		this.levelService = dependency(ServerLevelService);
	}

	/** @hidden */
	public onHeartbeat(world: World, [state]: ServerParams): void {
		for (const entity of querySimpleGuard()) {
			const simpleGuard = world.get(entity, SimpleGuard);

			switch (simpleGuard.state) {
				case EAIStates.Idle: {
					this.updateIdle(entity);
					break;
				}
				case EAIStates.Walking: {
					this.updateWalking(entity);
					break;
				}
				case EAIStates.Occupied: {
					this.updateOccupied(entity);
					break;
				}
				case EAIStates.Disturbed: {
					this.updateDisturbed(entity);
					break;
				}
				case EAIStates.Searching: {
					this.updateSearching(entity);
					break;
				}
				case EAIStates.AdvancedSearching: {
					this.updateAdvancedSearching(entity);
					break;
				}
				case EAIStates.Arresting: {
					this.updateArresting(entity);
					break;
				}
				case EAIStates.Hostile: {
					this.updateHostile(entity);
					break;
				}
				case EAIStates.Surrendering: {
					this.updateSurrendering(entity);
					break;
				}
			}

			// const levelNodes = this.levelService.getLevel()?.nodes;
			// if (levelNodes === undefined) continue;

			// if (simpleGuard.node === undefined) {
			// 	world.insert(entity, simpleGuard.patch({ node: Object.keys(levelNodes)[0] }));
			// 	continue;
			// }

			// if (pathfind.state === EPathfindingState.Idle) {
			// 	const node = simpleGuard.node ?? Object.keys(levelNodes)[0];
			// 	const nextNodes = levelNodes.get(node) ?? new Set();
			// 	nextNodes.delete(node);
			// 	const nextNode = getRand(Object.keys(nextNodes));
			// 	if (nextNode === undefined) continue;

			// 	world.insert(entity, simpleGuard.patch({ node: nextNode }));
			// 	world.insert(entity, pathfind.patch({ target: nextNode }));
			// }
		}
	}

	private updateIdle(entity: SimpleGuardEntity): void {
		const world = useWorld();

		const simpleGuard = world.get(entity, SimpleGuard);
		const worldEntity = world.get(entity, WorldEntity);

		for (const [_entity, call] of world.query(AdvancedSearchCall)) {
			this.startAdvancedSearching(entity);
			return;
		}

		const disturbance = this.checkForDisturbances(entity);
		if (disturbance !== undefined) {
			this.startDisturbed(entity, disturbance);
			return;
		}

		if (tick() - simpleGuard.lastOccupiedTime > 5) {
			if (math.random() < 0.1) {
				this.startOccupied(entity);
				return;
			}

			world.insert(entity, simpleGuard.patch({ lastOccupiedTime: tick() }));
		}

		const stateDuration = simpleGuard.stateDuration;
		if (tick() - simpleGuard.stateStartTime > (stateDuration === None ? 0 : (stateDuration as number))) {
			this.startWalking(entity);
		}

		// Check for call entity calling to advanced searching state
		// Check for disturbances (Items in lights, sounds, etc.)
		// Check for random chance to move to occupied state
		// Check for should switch to walking state
	}

	private updateWalking(entity: SimpleGuardEntity): void {
		const world = useWorld();

		const simpleGuard = world.get(entity, SimpleGuard);
		const pathfinding = world.get(entity, AgentPathfinding);

		for (const [_entity, call] of world.query(AdvancedSearchCall)) {
			this.startAdvancedSearching(entity);
			return;
		}

		const disturbance = this.checkForDisturbances(entity);
		if (disturbance !== undefined) {
			this.startDisturbed(entity, disturbance);
			return;
		}

		if (tick() - simpleGuard.lastOccupiedTime > 5) {
			if (math.random() < 0.1) {
				this.startOccupied(entity);
				return;
			}

			world.insert(entity, simpleGuard.patch({ lastOccupiedTime: tick() }));
		}

		if (pathfinding.state === EPathfindingState.Idle) {
			this.startIdle(entity);
		}

		// Check for call entity calling to advanced searching state
		// Check for disturbances (Items in lights, sounds, etc.)
		// Check for should switch to idle state state (is finished with current path)
		// Check for random chance to move to occupied state
	}

	private updateOccupied(entity: SimpleGuardEntity): void {
		const world = useWorld();

		const simpleGuard = world.get(entity, SimpleGuard);
		const pathfinding = world.get(entity, AgentPathfinding);

		for (const [_entity, call] of world.query(AdvancedSearchCall)) {
			this.startAdvancedSearching(entity);
			return;
		}

		const disturbance = this.checkForDisturbances(entity);
		if (disturbance !== undefined) {
			this.startDisturbed(entity, disturbance);
			return;
		}

		if (tick() - simpleGuard.lastOccupiedTime > 5) {
			world.insert(entity, simpleGuard.patch({ lastOccupiedTime: tick() }));

			world.insert(entity, pathfinding.patch({ target: simpleGuard.node }));

			if (pathfinding.target === undefined) {
				this.startIdle(entity);
			} else {
				this.startWalking(entity);
			}
			return;
		}

		// Check for call entity calling to advanced searching state
		// Check for disturbances
		// Check for should switch to idle state (is no longer occupied)
	}

	private updateDisturbed(entity: SimpleGuardEntity): void {
		// Check for call entity calling to advanced searching state
		// Check for additional disturbances
		//     If disturbance tolerance meets limit, should begin searching mode
		//     If disturbance is too frightening, or tolerance is exceeded, trigger an advanced search
		//     If player is spotted, trigger arresting state
		// Check for should switch to idle state

		
	}

	private updateSearching(entity: SimpleGuardEntity): void {
		// Check for call entity calling to advanced searching state
		// Check for additional disturbances
		//     If disturbance tolerance is exceeded, trigger an advanced search
		//     If player is spotted, trigger an arresting state
		// Check for should switch to idle state
		// Update search targets
	}

	private updateAdvancedSearching(entity: SimpleGuardEntity): void {
		// Check for additional disturbances
		// Check for should switch to idle state
		// Update search targets
	}

	private updateArresting(entity: SimpleGuardEntity): void {
		// Check for triggering alarm
		//     If no guard is triggering the alarm, begin triggering the alarm
		// Check for arrest target becoming hostile
		// Check for target intimidation
		//     If target intimidation exceeds tolerance, surrender
	}

	private updateHostile(entity: SimpleGuardEntity): void {
		// Check for target intimidation
		//     If target intimidation exceeds tolerance, surrender
		// Fire at target
	}

	private updateSurrendering(entity: SimpleGuardEntity): void {
		// Do nothing, you surrendered noob
	}

	private startAdvancedSearching(entity: SimpleGuardEntity): void {}

	private startDisturbed(entity: SimpleGuardEntity, disturbanceEntity: DisturbanceEntity): void {
		const world = useWorld();

		const simpleGuard = world.get(entity, SimpleGuard);
		const worldEntity = world.get(entity, WorldEntity);
		const pathfinding = world.get(entity, AgentPathfinding);

		const disturbance = world.get(disturbanceEntity, Disturbance);
		const disturbanceWorldEntity = world.get(disturbanceEntity, WorldEntity);

		worldEntity.root.CFrame = flatLookAt(worldEntity.root.Position, disturbanceWorldEntity.root.Position);

		world.insert(
			entity,
			simpleGuard.patch({ state: EAIStates.Disturbed, stateDuration: 2, stateStartTime: os.clock() }),
		);
		world.insert(entity, pathfinding.patch({ target: None }));
	}

	private startOccupied(entity: SimpleGuardEntity): void {
		const world = useWorld();

		const simpleGuard = world.get(entity, SimpleGuard);
		const pathfinding = world.get(entity, AgentPathfinding);

		world.insert(entity, simpleGuard.patch({ lastOccupiedTime: tick(), state: EAIStates.Occupied }));
		world.insert(entity, pathfinding.patch({ target: None }));
	}

	private startWalking(entity: SimpleGuardEntity): void {
		const world = useWorld();

		const simpleGuard = world.get(entity, SimpleGuard);
		const pathfinding = world.get(entity, AgentPathfinding);

		if (isNone(pathfinding.target) || isNone(simpleGuard.node)) {
			const [hasNewNode, newNode] = isNone(simpleGuard.node)
				? this.levelService.getAvailableNode()
				: this.levelService.getAvailableConnectedNode(simpleGuard.node);

			if (newNode === undefined) {
				return;
			}

			if (!isNone(simpleGuard.node)) this.levelService.releaseNode(simpleGuard.node);

			world.insert(entity, pathfinding.patch({ target: newNode }));
			world.insert(entity, simpleGuard.patch({ node: newNode, state: EAIStates.Walking }));
			return;
		}

		world.insert(entity, simpleGuard.patch({ state: EAIStates.Walking }));
	}

	private startIdle(entity: SimpleGuardEntity): void {
		const world = useWorld();

		const simpleGuard = world.get(entity, SimpleGuard);
		const pathfinding = world.get(entity, AgentPathfinding);

		if (!isNone(simpleGuard.node)) this.levelService.releaseNode(simpleGuard.node);

		world.insert(entity, pathfinding.patch({ target: None }));
		const path2 = world.get(entity, AgentPathfinding);
		world.insert(entity, simpleGuard.patch({ state: EAIStates.Idle, stateDuration: 2 }));
	}

	private checkForDisturbances(entity: SimpleGuardEntity): DisturbanceEntity | undefined {
		const world = useWorld();

		const worldEntity = world.get(entity, WorldEntity);

		for (const disturbanceEntity of queryDisturbance()) {
			const disturbance = world.get(disturbanceEntity, Disturbance);
			if (!disturbance.active) continue;

			const disturbanceWorldEntity = world.get(disturbanceEntity, WorldEntity);
			if (worldEntity.root.Position.sub(disturbanceWorldEntity.root.Position).Magnitude > disturbance.radius) {
				continue;
			}

			return disturbanceEntity;
		}
	}
}
