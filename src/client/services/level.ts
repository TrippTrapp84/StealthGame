import { World } from "@rbxts/matter";
import { ClientParams, ClientService } from "types/generic";

export default class LevelService implements ClientService {
	/** @hidden */
	public onInit(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onStart(world: World, [state]: ClientParams): void {}
}
