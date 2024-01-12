import { ESpawners } from "server/util/spawners";
import { ELevels } from "types/enums/levels";

export interface ILevelData extends Folder {
	Static: Folder;
	Name: ELevels;
	Spawns: {
		GetChildren(): Array<
			Part & {
				GetAttribute(att: "type"): ESpawners;
				GetAttribute(att: "rate"): number | undefined;
				GetAttribute(att: "delay"): number | undefined;
			}
		>;
	} & Folder;

	Nodes: {
		GetChildren(): Array<BasePart>;
	} & Folder;
}
