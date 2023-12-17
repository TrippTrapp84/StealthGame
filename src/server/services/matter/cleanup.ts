import { World } from "@rbxts/matter";
import { CleanupComponents } from "shared/util/matter/component";
import { ServerParams, ServerService } from "types/generic";
import { EServicePriority } from "types/matter/service";

export default class CleanupService implements ServerService {
	public priority = EServicePriority.First;

	/** @hidden */
	public onRender(world: World, [state]: ServerParams): void {
		this.resolveCleanups(world);
	}

	/** @hidden */
	public onPhysics(world: World, [state]: ServerParams): void {
		this.resolveCleanups(world);
	}

	/** @hidden */
	public onHeartbeat(world: World, [state]: ServerParams): void {
		this.resolveCleanups(world);
	}

	private resolveCleanups(world: World): void {
		for (const [comp, cleanup] of CleanupComponents) {
			for (const [entity, changes] of world.queryChanged(comp)) {
				if (changes.new !== undefined || changes.old === undefined) continue;

				cleanup(changes.old);
			}
		}
	}
}
