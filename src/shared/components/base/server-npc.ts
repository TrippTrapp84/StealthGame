import { component, None } from "@rbxts/matter";
import { WorldEntity } from "./world-entity";
import { makePrefab } from "shared/util/prefabs";
import { makeAgent } from "./agent";
import { makeComponent } from "shared/util/matter/component";
import { makeReplicatedComponent } from "shared/util/matter/replication";
import { HttpService } from "@rbxts/services";

export interface ServerNPC {
	id: `ServerNPC-${string}`;
	owner: None;

	agent: ModelWithPrimaryPart;
}

export const ServerNPC = makeReplicatedComponent<ServerNPC>("ServerNPC");

export function makeServerNPC() {
	const [worldEntity, agent] = makeAgent();

	const id = HttpService.GenerateGUID();

	return [worldEntity, agent, ServerNPC({ id: `ServerNPC-${id}`, owner: None, agent: agent.model })] as const;
}
