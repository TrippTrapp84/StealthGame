import { component } from "@rbxts/matter";
import { WorldEntity } from "./world-entity";
import { makePrefab } from "shared/util/prefabs";
import { Workspace } from "@rbxts/services";
import { makeComponent } from "shared/util/matter/component";
import React from "@rbxts/react";

export interface UserInterface {
	element: () => React.Element;
}

export const UserInterface = makeComponent<UserInterface>("UserInterface", { element: () => <></> });

export function makeUserInterface() {
	return [UserInterface()] as const;
}
