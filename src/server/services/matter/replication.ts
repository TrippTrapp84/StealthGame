import { Component, World } from "@rbxts/matter";
import Object from "@rbxts/object-utils";
import { ReplicatedComponents } from "shared/util/matter/replication";
import { ServerParams, ServerService } from "types/generic";
import { EServicePriority } from "types/matter/service";

export default class ServerReplicationService implements ServerService {
	public priority = EServicePriority.Last;

	public onHeartbeat(world: World, [state]: ServerParams): void {
		const replicated: Array<() => Component<object>> = Object.keys(ReplicatedComponents);

		// for (const comp of replicated) {
		// 	for (const [entity] of world.queryChanged(comp)) {
		// 	}
		// }
	}
}
