import { makeReplicatedComponent } from "shared/util/matter/replication";

export interface PlayerCharacter {
	id: `PlayerCharacter_${number}`;
}

export const PlayerCharacter = makeReplicatedComponent<PlayerCharacter>("PlayerCharacter", undefined, (comp) => {});
