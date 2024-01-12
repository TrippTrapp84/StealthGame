import { CollectionService } from "@rbxts/services";

export const enum ETags {
	Collision = "Collision",
}

export function getTagged(tag: ETags): Array<Instance> {
	return CollectionService.GetTagged(tag);
}
