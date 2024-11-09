import { dependency } from "shared/util/matter/start";
import CameraController from "client/services/camera/camera";
import { ECameraEffects } from "types/enums/camera-effects";
import { ECameraTypes } from "types/enums/camera-types";

export abstract class CameraEffectBase {
	public id!: string;
	public readonly cameraStates = new Array<ECameraTypes>();

	public readonly effectType!: ECameraEffects;

	protected constructor() {
		task.defer(() => {
			const cameraController = dependency(CameraController);

			const state = cameraController.getState();
			if (!this.cameraStates.includes(state)) {
				return;
			}

			const [_added, id] = cameraController.addEffect({
				effect: (cf, dt, fov) => {
					return this.onEffect(cf, dt, fov);
				},
				onRemoved: () => {
					this.onRemoved();
				},
				type: this.effectType,
			});

			this.id = id;
		});
	}

	public abstract onEffect(cf: CFrame, dt: number, fov: number): [cf: CFrame, fov?: number];
	public onRemoved(): void {}

	protected remove(): void {
		dependency(CameraController).removeEffect(this.id);
	}
}

interface ICameraEffectDecoratorConfig {
	effectType: ECameraEffects;
}
