import { ELevels } from "types/enums/levels";
import { ILevelData } from "types/interfaces/level";

export interface SharedState {
	level?: ILevelData;

	/** A universal delta time for the entire frame, recalculated at the beginning of render step */
	dt: number;
}
