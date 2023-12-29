import { Janitor } from "@rbxts/janitor";
import { World } from "@rbxts/matter";
import { UserInputService, Workspace } from "@rbxts/services";
import { getVecXZRelativeCamera } from "shared/util/camera";
import { makePrefab } from "shared/util/prefabs";
import { ClientParams, ClientService } from "types/generic";

export enum ECharacterState {
	Standing,
	Walking,
	Jumping,
	Climbing,
	Dead,
	Falling,

	Disabled,
}

export default class CharacterController implements ClientService {
	private readonly characterJanitor = new Janitor();
	private readonly stateJanitor = new Janitor();

	private character?: ModelWithPrimaryPart;

	private characterState = ECharacterState.Standing;

	/** @hidden */
	public onInit(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onStart(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onRender(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onPhysics(world: World, [state]: ClientParams): void {}

	/** @hidden */
	public onHeartbeat(world: World, [state]: ClientParams): void {
		if (this.character === undefined) return;
		if (this.characterState === ECharacterState.Disabled) return;

		this.updateCharacter(this.character, state.dt);
	}

	private updateCharacter(character: ModelWithPrimaryPart, dt: number) {
		switch (this.characterState) {
			case ECharacterState.Standing:
			case ECharacterState.Walking: {
				this.updateWalking();
				break;
			}
		}
	}

	private setState(state: ECharacterState): void {
		this.characterState = state;
		this.stateJanitor.Cleanup();
	}

	private updateWalking(character: ModelWithPrimaryPart): void {
		const moveDirection = this.getMoveVector();

		if (moveDirection.Magnitude < 0.25) return;
	}

	private getMoveVector(): Vector3 {
		if (UserInputService.KeyboardEnabled) {
			const move = new Vector3(
				(UserInputService.IsKeyDown(Enum.KeyCode.D) ? 1 : 0) +
					(UserInputService.IsKeyDown(Enum.KeyCode.A) ? -1 : 0),
				0,
				(UserInputService.IsKeyDown(Enum.KeyCode.W) ? 1 : 0) +
					(UserInputService.IsKeyDown(Enum.KeyCode.S) ? -1 : 0),
			);

			const headRelative = getVecXZRelativeCamera(move);

			return headRelative;
		}

		return Vector3.zero;
	}

	public spawnCharacter(): ModelWithPrimaryPart {
		const character = makePrefab("Character");

		this.setupControls();

		return character;
	}
}
