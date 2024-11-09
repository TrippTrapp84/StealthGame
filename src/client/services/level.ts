import { World } from "@rbxts/matter";
import { Events } from "client/network";
import { Spawners } from "client/util/spawners";
import { useWorld } from "shared/util/matter/start";
import { ELevels } from "types/enums/levels";
import { ClientParams, ClientService } from "types/generic";
import { ILevelData } from "types/interfaces/level";

export default class ClientLevelService implements ClientService {
	private level?: {
		instance: ILevelData;
		nodes: Map<BasePart, Set<BasePart>>;
	};

	/** @hidden */
	public onInit(world: World, [state]: ClientParams): void {
		Events.levelLoaded.connect((level) => this.loadLevel(level));
	}

	/** @hidden */
	public onStart(world: World, [state]: ClientParams): void {}

	public loadLevel(level: ILevelData): void {
		const world = useWorld();

		const nodeGraph = new Map<BasePart, Set<BasePart>>();
		level.Nodes.GetChildren().forEach((p) => {
			const connected = nodeGraph.get(p) ?? new Set<BasePart>();
			nodeGraph.set(p, connected);

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

		level.Spawns.GetChildren().forEach((s) => {
			const spawnType = s.GetAttribute("type");
			const rate = s.GetAttribute("rate") ?? 0;
			const delay = s.GetAttribute("delay") ?? 0;

			const spawner = Spawners[spawnType];
			if (spawner === undefined) return;

			print("SPAWNING", spawnType);

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
	}

	public getLevel(): typeof this.level {
		return this.level;
	}
}
