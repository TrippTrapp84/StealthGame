import { UserInputService } from "@rbxts/services";

import { CameraEffectBase } from "../camera-effects-base";
import { ECameraEffects } from "types/enums/camera-effects";
import { ECameraTypes } from "types/enums/camera-types";

export interface IShakeConfig {
	dampener: number;
	duration: number;
	intensity: number;
}

export class CameraShakeEffect extends CameraEffectBase {
	public cameraStates = [];
	public effectType = ECameraEffects.Shake;

	private startTime = os.clock();

	private random = new Random(os.clock());

	private noiseRands = [
		{ x: this.random.NextNumber() * 1000, y: this.random.NextNumber() * 1000 },
		{ x: this.random.NextNumber() * 1000, y: this.random.NextNumber() * 1000 },
		{ x: this.random.NextNumber() * 1000, y: this.random.NextNumber() * 1000 },
	];

	/**
	 *
	 * @param duration The length of time of the camera shake
	 * @param strength How strong the displacement of the camera is
	 * @param intensity How quickly or intensely the camera shakes
	 * @param easingIn How long the shake should fade in for
	 * @param easingOut How long the shake should fade out for. Defaults to `easingIn`
	 */
	constructor(
		private duration: number,
		private strength: number,
		private intensity: number,
		private easingIn: number,
		private easingOut = easingIn,
	) {
		super();

		task.delay(duration, () => {
			this.remove();
		});
	}

	public onEffect(cf: CFrame, dt: number, fov: number): [cf: CFrame, fov?: number | undefined] {
		const currentTime = os.clock();

		const elapsed = currentTime - this.startTime;
		let strength = this.strength;
		if (elapsed < this.easingIn) {
			strength *= (elapsed / this.easingIn) ** 3;
		} else if (elapsed > this.duration - this.easingOut) {
			strength *= ((this.startTime + this.duration - currentTime) / this.easingOut) ** 3;
		}

		const rand = this.noiseRands;
		const x = math.noise(rand[0].x, rand[0].y, os.clock() * this.intensity) * strength;
		const y = math.noise(rand[1].x, rand[1].y, os.clock() * this.intensity) * strength;
		const z = math.noise(rand[2].x, rand[2].y, os.clock() * this.intensity) * strength;

		return [cf.mul(CFrame.Angles(math.rad(x), math.rad(y), math.rad(z)))];
	}
}
