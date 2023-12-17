import { component } from "@rbxts/matter";
import { WorldEntity } from "./world-entity";
import { makePrefab } from "shared/util/prefabs";
import { makeAgent } from "./agent";
import { makeComponent } from "shared/util/matter/component";

export interface HumanNPC {
	character: Model;
}

export const HumanNPC = makeComponent<HumanNPC>("HumanNPC");

export function makeHumanNPC() {
	const [worldEntity, agent] = makeAgent();

	const character = makePrefab("RootModel", agent.model);

	return [worldEntity, agent, HumanNPC({ character })] as const;
}
