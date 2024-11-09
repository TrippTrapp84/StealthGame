import { World } from "@rbxts/matter";
import { ReplicatedStorage, ServerStorage } from "@rbxts/services";
import { Functions } from "server/network";
import { ReplicatedComponents } from "shared/util/matter/replication";
import { EErrors } from "types/enums/error-types";
import { ServerParams, ServerService } from "types/generic";

export default class AssetsService implements ServerService {
	/** @hidden */
	public onInit(world: World, [state]: ServerParams): void {
		Functions.requestAsset.setCallback((_player, id) => {
			const replicatedAsset = ReplicatedStorage.Assets.FindFirstChild(id);
			if (replicatedAsset !== undefined) return { success: true, data: replicatedAsset };

			const serverAsset = ServerStorage.Assets.Models.FindFirstChild(id);
			if (serverAsset !== undefined) {
				const asset = serverAsset.Clone();
				asset.Parent = ReplicatedStorage.Assets;
				return { success: true, data: asset };
			}

			return { success: false, error: EErrors.AssetNotFound };
		});
	}

	/** @hidden */
	public onStart(world: World, [state]: ServerParams): void {}

	/** @hidden */
	public onRender(world: World, [state]: ServerParams): void {}

	/** @hidden */
	public onPhysics(world: World, [state]: ServerParams): void {}

	/** @hidden */
	public onHeartbeat(world: World, [state]: ServerParams): void {}
}
