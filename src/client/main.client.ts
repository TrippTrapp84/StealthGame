import { startMatter } from "shared/util/matter/start";
import { ClientParams, ClientService } from "types/generic";

const state = {
	dt: 0,
};

const [world, loop] = startMatter<ClientService, [ClientParams]>(script.Parent!.FindFirstChild("services") as Folder, [
	state,
]);
