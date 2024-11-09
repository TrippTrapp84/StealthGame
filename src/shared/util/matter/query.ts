import { Component, Entity, InferComponents, World } from "@rbxts/matter";
import { ComponentCtor, DynamicBundle } from "@rbxts/matter/lib/component";

export function* makeQuery<const C extends ComponentCtor[]>(
	world: World,
	components: C,
): Generator<Entity<InferComponents<C>>> {
	const query = world.query(...components);

	for (const [entity, c1, c2, c3] of query) {
		// const resultComps = new Array<InferComponents<C>>();
		// resultComps.push(entity as never);

		// for (const res of [comp1, comp2, comp3] as Array<InferComponents<C>>) {
		// 	const index = returns.indexOf(getmetatable(res) as never);
		// 	print(res, index, getmetatable(res));

		// 	if (index !== -1) {
		// 		resultComps[index + 1] = res;
		// 	}
		// }

		yield entity as Entity<InferComponents<C>>;
	}
}
