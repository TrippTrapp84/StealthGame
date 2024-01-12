import { World } from "@rbxts/matter";
import { Events } from "client/network";
import { ReplicatedComponents } from "shared/util/matter/replication";
import { ClientParams, ClientService } from "types/generic";

export default class ReplicationService implements ClientService {
	private data = new Map<string, Record<string, unknown>>();
	private queue = new Set<string>();

	/** @hidden */
	public onInit(world: World, [state]: ClientParams): void {
		Events.replicationAdded.connect((id, data) => {
			this.data.set(id, data);
			this.queue.add(id);
		});
		Events.replicationChanged.connect((id, data) => {
			this.data.set(id, data);
			this.queue.add(id);
		});
		Events.replicationRemoved.connect((id, data) => {
			this.data.delete(id);
			this.queue.delete(id);
		});
	}

	/** @hidden */
	public onStart(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onRender(world: World, [state]: ClientParams): void {
		for (const repComp of ReplicatedComponents) {
			for (const [entity, comp] of world.query(repComp)) {
				if (!this.queue.has(comp.id)) continue;

				world.insert(entity, comp.patch(this.data.get(comp.id) as never));
			}
		}
	}

	/** @hidden */
	public onPhysics(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onHeartbeat(world: World, [state]: ClientParams): void {}
}