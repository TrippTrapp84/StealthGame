import { Janitor } from "@rbxts/janitor";
import { World } from "@rbxts/matter";
import { UserInputService, Workspace } from "@rbxts/services";
import { Events } from "client/network";
import { getVecXZRelativeCamera } from "shared/util/camera";
import { makePrefab } from "shared/util/prefabs";
import { ClientParams, ClientService } from "types/generic";
import { CameraEffectBase } from "../camera copy/effects/camera-effects-base";
import { ETags, getTagged } from "shared/util/tags";
import { vector3XZ } from "shared/util/vector";
import { lineIntersection } from "shared/util/math";

export enum ECharacterState {
	Standing,
	Walking,
	Jumping,
	Climbing,
	Dead,
	Falling,

	Disabled,
}

type Character = ReturnType<typeof makePrefab<"PlayerCharacter">>;

export default class CharacterController implements ClientService {
	private readonly characterJanitor = new Janitor();
	private readonly stateJanitor = new Janitor();

	private readonly hitboxParams: RaycastParams;

	private character?: Character;

	private characterState = ECharacterState.Standing;

	constructor() {
		this.hitboxParams = new RaycastParams();

		this.hitboxParams.RespectCanCollide = false;
		this.hitboxParams.IgnoreWater = true;
		this.hitboxParams.FilterType = Enum.RaycastFilterType.Include;
	}

	/** @hidden */
	public onInit(world: World, [state]: ClientParams): void {
		Events.characterSpawned.connect(() => {
			if (this.character !== undefined) {
				this.character.Destroy();
				this.stateJanitor.Cleanup();
				this.characterJanitor.Cleanup();
			}

			const character = this.makeCharacter();
			this.setupControls();
		});
	}

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

		let currentState = this.characterState;
		while (true) {
			this.updateCharacter(this.character, state.dt);

			if (currentState === this.characterState) break;
			currentState = this.characterState;
		}
	}

	private setupControls() {}

	private updateCharacter(character: Character, dt: number) {
		switch (this.characterState) {
			case ECharacterState.Standing:
			case ECharacterState.Walking: {
				this.updateWalking(character, dt);
				break;
			}
		}
	}

	private setState(state: ECharacterState): void {
		this.characterState = state;
		this.stateJanitor.Cleanup();
	}

	private startWalking(): void {
		this.setState(ECharacterState.Walking);
	}

	private updateWalking(character: Character, dt: number): void {
		const moveDirection = this.getMoveVector();

		{
			if (moveDirection.Magnitude < 0.25) {
				this.characterState = ECharacterState.Standing;
			} else {
				this.characterState = ECharacterState.Walking;
			}
		}
		if (this.characterState !== ECharacterState.Walking) return;

		this.moveCharacter(character, moveDirection.mul(dt));
	}

	private moveCharacter(character: Character, displacement: Vector3) {
		this.characterLateralMove(character, displacement);

		this.characterSlopeUpdate(character, displacement);
	}

	private characterSlopeUpdate(character: Character, displacement: Vector3) {}

	private characterLateralMove(character: Character, displacement: Vector3): void {
		const hitbox = character.Hitbox;

		this.hitboxParams.FilterDescendantsInstances = getTagged(ETags.Collision);

		const res = Workspace.Shapecast(hitbox, displacement, this.hitboxParams);
		if (res === undefined) {
			character.PivotTo(character.GetPivot().add(displacement));
			return;
		}

		const pos = res.Position;
		const normal = vector3XZ(res.Normal).Unit;

		if (normal !== normal) return;
		const parallel = normal.Cross(Vector3.yAxis);

		const movement = parallel.mul(displacement.Dot(parallel));

		const res2 = Workspace.Shapecast(hitbox, movement, this.hitboxParams);
		if (res2 === undefined) {
			character.PivotTo(character.GetPivot().add(movement));
			return;
		}

		const pos2 = res2.Position;
		const normal2 = vector3XZ(res2.Normal).Unit;

		if (normal2 !== normal2) return;
		const parallel2 = normal2.Cross(Vector3.yAxis);

		const intersection = lineIntersection(pos, pos.add(parallel), pos2, pos2.add(parallel2));

		const offset = intersection.sub(
			new Vector3(math.sign(pos.X - intersection.X), 0, math.sign(pos.Z - intersection.Z)).mul(hitbox.Size.Z),
		);

		character.PivotTo(character.GetPivot().Rotation.add(offset));
	}

	private slopeEscapeForce(angle: number): number {
		if (math.abs(angle) < 0.001) return math.huge;
		return 1 / math.tan(angle);
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

	public makeCharacter(): Character {
		const character = makePrefab("PlayerCharacter");

		return character;
	}
}
