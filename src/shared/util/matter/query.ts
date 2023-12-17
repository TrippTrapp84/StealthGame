import { Component, Entity, InferComponents, World } from "@rbxts/matter";
import { ComponentCtor, DynamicBundle } from "@rbxts/matter/lib/component";

export function* makeQuery<const C extends ComponentCtor[], const R extends ComponentCtor[]>(
	world: World,
	components: C,
	returns: R,
) {
	type Returns = { [K in keyof R]: ReturnType<R[K]> };

	const query = world.query(...components);

	for (const data of query) {
		const resultComps = new Array<InferComponents<C>>();
		resultComps.push(data.remove(0) as never);

		for (const res of data as Array<InferComponents<C>>) {
			const index = returns.indexOf(getmetatable(res) as never);

			if (index !== -1) {
				resultComps[index] = res;
			}
		}

		yield resultComps as never as [Entity<InferComponents<C>>, ...Returns];
	}
}
