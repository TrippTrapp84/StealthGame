import { CollectionService } from "@rbxts/services";

export const enum ETags {
	Collision = "Collision",
	Spawner = "Spawner",

	LevelFolder = "LevelFolder",

	LightCollision = "LightCollision",
}

export function getTagged(tag: ETags): Array<Instance> {
	return CollectionService.GetTagged(tag);
}
