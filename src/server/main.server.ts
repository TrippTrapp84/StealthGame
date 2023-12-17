import { dependency, startMatter } from "shared/util/matter/start";
import { ServerParams, ServerService } from "types/generic";
import ServerLevelService from "./services/level";
import { ELevels } from "types/enums/levels";

const state = {
	dt: 0,
};

const [world, loop] = startMatter<ServerService, [ServerParams]>(script.Parent!.FindFirstChild("services") as Folder, [
	state,
]);

dependency(ServerLevelService).loadLevel(world, [state], ELevels.Demo);
