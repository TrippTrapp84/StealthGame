import { Janitor } from "@rbxts/janitor";
import Object from "@rbxts/object-utils";
import { Workspace, HttpService, UserInputService, RunService, Players } from "@rbxts/services";
import { ClientParams, ClientService } from "types/generic";
import { ILevelData } from "types/interfaces/level";
import Signal from "@rbxts/signal";
import { ECameraEffects } from "types/enums/camera-effects";
import { ECameraTransitions } from "types/enums/camera-transition";
import { ECameraTypes } from "types/enums/camera-types";
import { World, useDeltaTime } from "@rbxts/matter";

type EffectCallback = (
	cf: CFrame,
	dt: number,
	fov: number,
	isDFov: boolean,
) => [cf: CFrame, fov?: number, dfov?: number];
type EffectStack = Array<CameraEffectData & { id: string }>;
export interface CameraEffectData {
	effect: EffectCallback;
	onRemoved?: () => void;
	type: ECameraEffects;
}

export default class CameraService extends ClientService {
	private currentState = ECameraTypes.Custom;
	private camera = Workspace.CurrentCamera!;
	private cameraCF = this.camera.CFrame;

	private stack: EffectStack = [
		{ id: HttpService.GenerateGUID(false), effect: (cf) => [cf], type: ECameraEffects.Core },
	];
	private isStackUpdating = false;
	private shouldSortStack = false;
	private shouldCameraUpdate = true;
	private stackUpdates = new Array<
		[true, CameraEffectData & { id: string }, () => void] | [false, string, () => void]
	>();

	private janitor = new Janitor();

	private transitionJanitor = new Janitor();

	private controls = {
		pan: {
			signal: new Signal<(input: number) => void>(),
			value: 0,
		},
		pitch: {
			signal: new Signal<(input: number) => void>(),
			value: 0,
		},
		tilt: {
			signal: new Signal<(input: number) => void>(),
			value: 0,
		},
		zoom: {
			signal: new Signal<(input: number) => void>(),
			value: 0,
		},
	};

	/** @hidden */
	public onInit(): void {
		UserInputService.InputBegan.Connect((input) => {
			if (input.UserInputType === Enum.UserInputType.MouseWheel) {
				this.controls.zoom.value += input.Position.Z;
				this.controls.zoom.signal.Fire(this.controls.zoom.value);
			}
		});

		// UserInputService.TouchPinch.Connect()
	}

	/** @hidden */
	public onStart(): void {
		// LevelLoaderSignals.LevelLoaded.Connect((_, level) => {
		// 	print("CAMERA LEVEL CHANGED", this.shouldCameraUpdate, this.getState());
		// 	if (!this.shouldCameraUpdate) {
		// 		return;
		// 	}
		// 	this.camera.CameraSubject = level.FindFirstChild("ConstructionGridWall") as BasePart;
		// });
		// if ($NODE_ENV === Environment.Dev) {
		// 	UserInputService.InputBegan.Connect(({ KeyCode }) => {
		// 		if (KeyCode === Enum.KeyCode.KeypadOne) {
		// 			this.transition(ECameraTransitions.WipeDown, 1).obscured.catch((e) => this.logger.Warn(e));
		// 		} else if (KeyCode === Enum.KeyCode.KeypadTwo) {
		// 			this.transition(ECameraTransitions.ZoomCenter, 1);
		// 		} else if (KeyCode === Enum.KeyCode.KeypadThree) {
		// 			this.transition(ECameraTransitions.FallingColumnsLeft, 1);
		// 		}
		// 	});
		// }
	}
	/** @hidden */
	public onRender(world: World, [state]: ClientParams): void {
		if (!this.shouldCameraUpdate) {
			return;
		}

		this.isStackUpdating = true;

		let cf = this.camera.CFrame;
		let fov = this.camera.FieldOfView;
		let isDFov = false;

		if (this.shouldSortStack) {
			this.sortEffectStack();
		}

		for (const { effect } of this.stack) {
			const [newCF, newFov, dFov] = effect(cf, useDeltaTime(), fov, isDFov);
			cf = newCF;
			fov = newFov ?? dFov ?? fov;
			isDFov = newFov === undefined && dFov !== undefined;
		}

		this.camera.CFrame = cf;
		if (isDFov) {
			this.camera.DiagonalFieldOfView = fov;
		} else {
			this.camera.FieldOfView = fov;
		}

		this.isStackUpdating = false;

		this.flushStackUpdates();
	}

	private sortEffectStack(): void {
		this.stack.sort((a, b) => {
			return a.type === b.type ? a.id < b.id : a.type < b.type;
		});

		this.shouldSortStack = false;
	}

	private setState(cameraState: ECameraTypes, cleanup = true): void {
		if (cleanup) {
			this.janitor.Cleanup();
			this.stop();
		}

		print("CAMERA STATE CHANGED", cameraState, debug.traceback());

		if (cameraState === ECameraTypes.Default) {
			this.shouldCameraUpdate = false;
		} else {
			this.shouldCameraUpdate = true;
			this.camera.CameraType = Enum.CameraType.Scriptable;
			// this.camera.CameraSubject = this.levelLoader.getCurrentLevel()?.FindFirstChild("ConstructionGridWall") as
			// 	| BasePart
			// 	| undefined;
		}

		this.currentState = cameraState;
	}

	private flushStackUpdates(): void {
		for (const [adding, data] of this.stackUpdates) {
			if (adding) {
				this.addEffect(data);
			} else {
				this.removeEffect(data);
			}
		}

		this.sortEffectStack();
		this.stackUpdates.clear();
	}

	/**
	 * Adds an effect to the camera stack.
	 *
	 * Returns a promise that resolves once the effect is properly added to the
	 * stack, and an id for your effect in the stack.\ Be sure to keep track of
	 * the return id, as you MUST have this to properly remove your effect later.
	 */
	public addEffect(effect: CameraEffectData): [added: Promise<void>, id: string] {
		const id = HttpService.GenerateGUID(false);

		if (!this.isStackUpdating) {
			this.stack.push({ ...effect, id });
			this.shouldSortStack = true;
			return [Promise.resolve(), id];
		}

		let resolve: () => void;
		const promise = new Promise<void>((res) => {
			resolve = res;
		});

		this.stackUpdates.push([true, { ...effect, id }, resolve!]);
		return [promise, id];
	}

	/**
	 * A quick wrapper for adding core logic for camera states
	 */
	private coreEffect(logic: EffectCallback): void {
		this.stack.clear();
		this.shouldSortStack = false;
		this.addEffect({ effect: logic, type: ECameraEffects.Core });
	}

	public async removeEffect(id: string): Promise<void> {
		if (!this.isStackUpdating) {
			this.stack.remove(this.stack.findIndex((value) => value.id === id));
			return;
		}

		const updateEntry = this.stackUpdates.findIndex(([adding, effect]) =>
			adding ? effect.id === id : effect === id,
		);
		if (updateEntry !== -1) {
			const [adding, _effect, resolve] = this.stackUpdates[updateEntry];

			if (!adding) {
				return Promise.resolve();
			}

			this.stackUpdates.remove(updateEntry);
			resolve();

			return Promise.resolve();
		}

		let resolve: () => void;
		const promise = new Promise<void>((res) => {
			resolve = res;
		});
		this.stackUpdates.push([false, id, resolve!]);

		return promise;
	}

	/**
	 * Stops and removes all effects on the camera, leaving only the camera state
	 * logic in control.
	 */
	public clear(): this {
		const logic = this.stack[0]!;
		this.stack.clear();
		this.shouldSortStack = false;
		this.stackUpdates.clear();
		this.stack.push(logic);

		return this;
	}

	/**
	 * Stops all effects and stops the camera state logic.\
	 * Equivalent to calling `clear()` followed by `setCustom(cf => cf)`
	 */
	public stop(): this {
		this.stack.clear();
		this.shouldSortStack = false;
		this.stackUpdates.clear();
		this.currentState = ECameraTypes.Custom;
		this.janitor.Cleanup();
		this.coreEffect((cf) => [cf]);

		return this;
	}

	/**
	 * Starts a visual scene transition, returning 2 promises representing the
	 * point when the screen is fully obscured and the end of the transition
	 * respectively.
	 * \
	 *  <b>__`IMPORTANT`__</b> The length of time between these two
	 * promises is not guaranteed, as a transition can be interrupted by another
	 * transition. This case is handled by resolving the promises of the previous
	 * transition immediately, in the order `obscured` (if not already resolved)
	 * then `finished`.
	 *
	 * This does not do any state or effect manipulation, and is usually intended
	 * for use by gamemode state consumers.
	 */
	public transition(
		transition?: ECameraTransitions,
		duration = 1,
	): {
		readonly finished: Promise<void>;
		readonly obscured: Promise<void>;
	} {
		this.transitionJanitor.Cleanup();

		let obscuredResolve: () => void;
		const obscured = new Promise<void>((res) => (obscuredResolve = res));
		this.transitionJanitor.Add(obscuredResolve!);

		let finishedResolve: () => void;
		const finished = new Promise<void>((res) => (finishedResolve = res));
		this.transitionJanitor.Add(finishedResolve!);

		const start = os.clock();
		let halfReached = false;
		this.transitionJanitor.Add(
			RunService.RenderStepped.Connect(() => {
				const current = os.clock();
				if (current - start > duration) {
					// CameraEvents.transitionProgressChanged.Fire(1);
					finishedResolve();
					this.transitionJanitor.Cleanup();
					// CameraEvents.transitionFinished.Fire();
					return;
				} else if (!halfReached && current - start > duration / 2) {
					halfReached = true;

					obscuredResolve();
				}

				// CameraEvents.transitionProgressChanged.Fire(current - start / duration);
			}),
		);

		const transitions = Object.values(ECameraTransitions);
		transitions.remove(transitions.findIndex((value) => value === ECameraTransitions.None));
		const camTransition = transition ?? transitions[math.random(0, transitions.size() - 1)];
		// CameraEvents.transitionStarted.Fire(camTransition);

		return {
			finished,
			obscured,
		};
	}

	private clearInputs(): void {
		this.controls.pan.value = 0;
		this.controls.pitch.value = 0;
		this.controls.tilt.value = 0;
		this.controls.zoom.value = 0;
	}

	private getBiggestFov(vFov?: number, hFov?: number, dFov?: number): number {
		const fov = this.camera.FieldOfView;
		const size = this.camera.ViewportSize;

		let biggestFov = fov;
		if (vFov !== undefined) {
			biggestFov = math.max(vFov, biggestFov);
		}

		if (hFov !== undefined) {
			const hv = math.deg(2 * math.atan((math.tan(math.rad(hFov) / 2) * size.Y) / size.X));
			biggestFov = math.max(biggestFov, hv);
		}

		if (dFov !== undefined) {
			this.camera.DiagonalFieldOfView = dFov;
			biggestFov = math.max(this.camera.FieldOfView, biggestFov);
			this.camera.FieldOfView = fov;
		}

		return biggestFov;
	}

	public setDefault(): this {
		this.setState(ECameraTypes.Default);

		this.camera.FieldOfView = 70;
		this.camera.CameraType = Enum.CameraType.Custom;
		this.camera.CameraSubject = Players.LocalPlayer.Character?.FindFirstChildOfClass("Humanoid");

		return this;
	}

	public setCustom(effect: EffectCallback): this {
		this.shouldCameraUpdate = true;
		this.setState(ECameraTypes.Custom);
		this.coreEffect(effect);

		return this;
	}

	public getState(): ECameraTypes {
		return this.currentState;
	}
}
