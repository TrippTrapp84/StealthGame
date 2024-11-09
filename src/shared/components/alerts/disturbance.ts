import { makeComponent } from "shared/util/matter/component";
import { WorldEntity } from "../base/world-entity";
import { EntityId } from "types/matter/world";
import { makeQuery } from "shared/util/matter/query";
import { useWorld } from "shared/util/matter/start";
import { Component, Entity } from "@rbxts/matter";

export interface Disturbance {
	radius: number;
	responders: Array<EntityId>;
	active: boolean;

	time: number;

	threat: number;
	hostile: boolean;
}

export type DisturbanceEntity = Entity<[Component<WorldEntity>, Component<Disturbance>]>;

export const Disturbance = makeComponent<Disturbance>("Disturbance", {
	radius: 0,
	responders: [],
	active: false,

	time: 0,

	threat: 0,
	hostile: false,
});

export function makeDisturbance({ root }: { root: BasePart }) {
	return [WorldEntity({ root }), Disturbance()] as const;
}

export function queryDisturbance() {
	return makeQuery(useWorld(), [WorldEntity, Disturbance]);
}
