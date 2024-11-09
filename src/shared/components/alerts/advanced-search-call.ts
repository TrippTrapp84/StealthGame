import { None, component } from "@rbxts/matter";
import { makePrefab } from "shared/util/prefabs";
import { WorldEntity } from "../base/world-entity";
import { Agent, makeAgent } from "../base/agent";
import { AgentPathfinding, EPathfindingState } from "../util/pathfinding";
import { PathfindingService } from "@rbxts/services";
import { PathLabelCosts, PathMaterialCosts } from "shared/meta/path-costs";
import { ServerNPC, makeServerNPC } from "../base/server-npc";
import { Entity, QueryResult, World } from "@rbxts/matter/lib/World";
import { makeComponent } from "shared/util/matter/component";
import { makeQuery } from "shared/util/matter/query";
import { ComponentCtor } from "@rbxts/matter/lib/component";
import { PathInstance } from "shared/util/path";
import { EAIStates } from "types/enums/ai-state";
import { Component } from "@rbxts/matter";

export interface AdvancedSearchCall {}

export const AdvancedSearchCall = makeComponent<AdvancedSearchCall>("AdvancedSearchCall");

export function makeAdvancedSearchCall() {
	return [AdvancedSearchCall()] as const;
}
