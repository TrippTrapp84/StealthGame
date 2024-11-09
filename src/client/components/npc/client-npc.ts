import { makeAgent } from "shared/components/base/agent";
import { WorldEntity } from "shared/components/base/world-entity";
import { makeComponent } from "shared/util/matter/component";
import { makePrefab } from "shared/util/prefabs";

export interface ClientNPC {
	character: ModelWithPrimaryPart;
}

export const ClientNPC = makeComponent<ClientNPC>("ClientNPC");

export function makeClientNPC() {
	const clientNPC = ClientNPC({ character: makePrefab("Character") });
	const worldEntity = WorldEntity({ root: clientNPC.character.PrimaryPart });

	return [worldEntity, clientNPC] as const;
}
