import { component } from "@rbxts/matter";
import { WorldEntity } from "./world-entity";
import { makePrefab } from "shared/util/prefabs";
import { Workspace } from "@rbxts/services";
import { makeComponent } from "shared/util/matter/component";

export interface Agent {
	model: ModelWithPrimaryPart;
}

export const Agent = makeComponent<Agent>("Agent", undefined, (comp) => {
	comp.model.Destroy();
});

export function makeAgent() {
	const model = makePrefab("RootModel", Workspace.Agents);

	return [WorldEntity({ root: model.PrimaryPart }), Agent({ model: model })] as const;
}
