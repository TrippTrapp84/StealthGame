import { ReplicatedStorage } from "@rbxts/services";
import { Events, Functions } from "client/network";
import { GlobalEvents } from "shared/network/network";

export enum EAssets {
	FlashlightCone = "FlashlightCone",
}

export function requestAsset(id: EAssets): Model | undefined {
	const asset = ReplicatedStorage.Assets.FindFirstChild(id);
	if (asset !== undefined) return asset;

	const [success, result] = Functions.requestAsset(id).await();
	if (!success) return;
	if (!result.success) return;

	return result.data;
}
