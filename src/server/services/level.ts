import { Janitor } from "@rbxts/janitor";
import { AnyEntity, Component, Entity, World } from "@rbxts/matter";
import { ServerStorage, Workspace } from "@rbxts/services";
import { makeAgent } from "shared/components/base/agent";
import { WorldEntity } from "shared/components/base/world-entity";
import { Spawners } from "shared/util/spawners";
import { ELevels } from "types/enums/levels";
import { ServerParams, ServerService } from "types/generic";
import { ILevelData } from "types/interfaces/level";

export default class ServerLevelService implements ServerService {
	private level?: {
		instance: ILevelData;
		nodes: Map<BasePart, Set<BasePart>>;
	};

	public readonly levelJanitor = new Janitor();

	/** @hidden */
	public onInit(world: World, [state]: ServerParams): void {}

	/** @hidden */
	public onStart(world: World, [state]: ServerParams): void {}

	public loadLevel(world: World, [state]: ServerParams, key: ELevels): ILevelData {
		const level = ServerStorage.Assets.Levels.FindFirstChild(key)!.Clone() as ILevelData;

		const nodeGraph = new Map<BasePart, Set<BasePart>>();
		level.Nodes.GetChildren().forEach((p) => {
			const connected = nodeGraph.get(p) ?? new Set<BasePart>();

			p.GetChildren()
				.mapFiltered((v) => (v.IsA("WeldConstraint") ? v : undefined))
				.forEach((w) => {
					if (!w.Enabled) return;

					const part = w.Part0 === p ? w.Part1 : w.Part0;
					if (part === undefined) return;
					if (part === p) return;

					connected.add(part);

					const partGraph = nodeGraph.get(part) ?? new Set<BasePart>();
					partGraph.add(p);
					nodeGraph.set(part, partGraph);
				});
		});

		this.level = { instance: level, nodes: nodeGraph };
		level.Parent = Workspace;

		level.Spawns.GetChildren().forEach((s) => {
			const spawnType = s.GetAttribute("type");
			const rate = s.GetAttribute("rate") ?? 0;
			const delay = s.GetAttribute("delay") ?? 0;

			if (delay > 0) task.wait(delay);

			Spawners[spawnType](world, s);
		});

		return level;
	}

	public getLevel(): typeof this.level {
		return this.level;
	}
}
