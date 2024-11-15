import { None } from "@rbxts/matter";
import { makeReplicatedComponent } from "shared/util/matter/replication";

export interface PlayerCharacter {
	id: `PlayerCharacter_${number}`;
	owner: UserId;
}

export const PlayerCharacter = makeReplicatedComponent<PlayerCharacter>("PlayerCharacter", undefined, (comp) => {});
