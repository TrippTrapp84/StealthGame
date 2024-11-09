import { dependency, startMatter } from "shared/util/matter/start";
import { ServerParams, ServerService } from "types/generic";
import ServerLevelService from "./services/level";
import { ELevels } from "types/enums/levels";
import { Events } from "./network";
import { promiseEvent } from "shared/util/event";
import { RunService } from "@rbxts/services";

const state = {
	dt: 0,
};

const [world, loop] = startMatter<ServerService, [ServerParams]>(script.Parent!.FindFirstChild("services") as Folder, [
	state,
]);

promiseEvent(Events.clientLoaded).expect();
dependency(ServerLevelService).loadLevel(world, [state], ELevels.Tutorial);
