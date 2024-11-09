import { Janitor } from "@rbxts/janitor";
import { AnyEntity, Component, Entity, World } from "@rbxts/matter";
import { ServerStorage, Workspace } from "@rbxts/services";
import { makeAgent } from "shared/components/base/agent";
import { WorldEntity } from "shared/components/base/world-entity";
import { Spawners } from "server/util/spawners";
import { ELevels } from "types/enums/levels";
import { ServerParams, ServerService } from "types/generic";
import { ILevelData } from "types/interfaces/level";
import { Events } from "server/network";
import { getRand } from "shared/util/array";
import Object from "@rbxts/object-utils";
import { ETags, getTagged } from "shared/util/tags";

export default class ServerLevelService implements ServerService {
	private level?: {
		instance: ILevelData;
		nodes: Map<BasePart, Set<BasePart>>;

		usedNodes: Set<BasePart>;
	};

	public readonly levelJanitor = new Janitor();

	/** @hidden */
	public onInit(world: World, [state]: ServerParams): void {
		for (const level of getTagged(ETags.LevelFolder)) {
			if (level.Parent?.IsDescendantOf(ServerStorage)) continue;

			level.Destroy();
		}
	}

	/** @hidden */
	public onStart(world: World, [state]: ServerParams): void {}

	public loadLevel(world: World, [state]: ServerParams, key: ELevels): ILevelData {
		const level = ServerStorage.Assets.Levels.FindFirstChild(key)!.Clone() as ILevelData;

		const nodeGraph = new Map<BasePart, Set<BasePart>>();
		level.Nodes.GetChildren().forEach((p) => {
			const connected = nodeGraph.get(p) ?? new Set<BasePart>();
			nodeGraph.set(p, connected);

			p.GetChildren()
				.mapFiltered((v) => (v.IsA("WeldConstraint") ? v : undefined))
				.forEach((w) => {
					if (!w.Enabled) return;

					const otherPart = w.Part0 === p ? w.Part1 : w.Part0;
					if (otherPart === undefined) return;
					if (otherPart === p) return;

					if (w.GetAttribute("IsOneWay") === true) {
						const partGraph = nodeGraph.get(w.Part0!) ?? new Set<BasePart>();
						partGraph.add(w.Part1!);
						nodeGraph.set(w.Part0!, partGraph);
					} else {
						connected.add(otherPart);

						const partGraph = nodeGraph.get(otherPart) ?? new Set<BasePart>();
						partGraph.add(p);
						nodeGraph.set(otherPart, partGraph);
					}
				});
		});
		print(nodeGraph);

		this.level = { instance: level, nodes: nodeGraph, usedNodes: new Set() };
		level.Parent = Workspace;

		level.Spawns.GetChildren().forEach((s) => {
			const spawnType = s.GetAttribute("type");
			const rate = s.GetAttribute("rate") ?? 0;
			const delay = s.GetAttribute("delay") ?? 0;

			const spawner = Spawners[spawnType];
			if (spawner === undefined) return;

			task.spawn(() => {
				if (delay > 0) {
					task.wait(delay);
				}

				spawner(world, s);

				if (rate > 0) {
					while (task.wait(rate) !== undefined) {
						spawner(world, s);
					}
				}
			});
		});

		Events.levelLoaded.broadcast(level);

		return level;
	}

	public useNode(node: BasePart): boolean {
		const level = this.level;
		if (level === undefined) return false;
		if (level.usedNodes.has(node)) return false;

		level.usedNodes.add(node);
		return true;
	}

	public releaseNode(node: BasePart): void {
		const level = this.level;
		if (level === undefined) return;

		level.usedNodes.delete(node);
	}

	public getAvailableConnectedNode(node: BasePart): Result<BasePart> {
		const level = this.level;
		if (level === undefined) return [false, undefined];

		const connectedNodes = level.nodes.get(node);
		if (connectedNodes === undefined) return [false, undefined];

		const availableNodes = Object.copy(connectedNodes);
		for (const used of level.usedNodes) availableNodes.delete(used);

		const nextNode = getRand(Object.keys(availableNodes));
		if (nextNode === undefined) return [false, undefined];

		return [true, nextNode];
	}

	public getAvailableNode(): Result<BasePart> {
		const level = this.level;
		if (level === undefined) return [false, undefined];

		const nodes = Object.keys(level.nodes);
		for (const used of level.usedNodes) nodes.unorderedRemove(nodes.indexOf(used));

		const nextNode = getRand(nodes);
		if (nextNode === undefined) return [false, undefined];

		return [true, nextNode];
	}

	public getLevel(): typeof this.level {
		return this.level;
	}
}
