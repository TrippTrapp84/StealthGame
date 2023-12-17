import { World } from "@rbxts/matter";
import { ServerParams, ServerService } from "types/generic";
import { EServicePriority } from "types/matter/service";

export default class StateService implements ServerService {
	public priority = EServicePriority.First;

	private lastFrame = tick();

	/** @hidden */
	public onInit(world: World, [state]: ServerParams): void {}

	/** @hidden */
	public onStart(world: World, [state]: ServerParams): void {
		this.lastFrame = tick();
	}

	/** @hidden */
	public onRender(world: World, [state]: ServerParams): void {
		state.dt = tick() - this.lastFrame;
	}

	/** @hidden */
	public onPhysics(world: World, [state]: ServerParams): void {}

	/** @hidden */
	public onHeartbeat(world: World, [state]: ServerParams): void {}
}
