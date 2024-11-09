import { Janitor } from "@rbxts/janitor";
import { Component, Entity, World, useDeltaTime } from "@rbxts/matter";
import { UserInputService, Workspace } from "@rbxts/services";
import { Events } from "client/network";
import { getVecXZRelativeCamera } from "shared/util/camera";
import { makePrefab } from "shared/util/prefabs";
import { ClientParams, ClientService } from "types/generic";
import { ETags, getTagged } from "shared/util/tags";
import { vector3PositiveY, vector3XZ } from "shared/util/vector";
import { dependency } from "shared/util/matter/start";
import CameraController from "../camera/camera";
import { PlayerCharacter } from "shared/components/replicated/player-character";
import { localPlayer } from "client/util/player";

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

const CHARACTER_SPEED = 20;
const CHARACTER_SPRINT_SPEED = 28;
const CHARACTER_CROUCH_SPEED = 10;
const CHARACTER_AIR_SPEED = 30;
const CHARACTER_ACCELERATION = 196;
const CHARACTER_JUMP_FORCE = 65;

const CHARACTER_WALL_OFFSET = 0.01;
const CHARACTER_STEP_TOLERANCE = 0.1;

export default class CharacterController implements ClientService {
	private readonly characterJanitor = new Janitor();
	private readonly stateJanitor = new Janitor();

	private readonly hitboxParams: RaycastParams;
	private readonly hitboxOverlapParams: OverlapParams;

	private character?: Character;
	private entity?: Entity<[Component<PlayerCharacter>]>;

	private characterState = ECharacterState.Standing;

	private cameraController!: CameraController;

	private crouching = false;
	private sprinting = false;

	private inputBuffer = {
		jump: false,
		sprint: false,
	};

	constructor() {
		this.hitboxParams = new RaycastParams();

		this.hitboxParams.RespectCanCollide = false;
		this.hitboxParams.IgnoreWater = true;
		this.hitboxParams.FilterType = Enum.RaycastFilterType.Include;

		this.hitboxOverlapParams = new OverlapParams();

		this.hitboxOverlapParams.RespectCanCollide = false;
		this.hitboxOverlapParams.FilterType = Enum.RaycastFilterType.Include;
	}

	/** @hidden */
	public onInit(world: World, [state]: ClientParams): void {
		this.cameraController = dependency(CameraController);

		Events.characterSpawned.connect((pos: Vector3) => {
			this.stateJanitor.Cleanup();
			this.characterJanitor.Cleanup();
			this.character?.Destroy();

			const character = (this.character = this.makeCharacter());
			character.Parent = Workspace.Agents;
			character.PivotTo(new CFrame(pos));

			const entity = world.spawn(
				PlayerCharacter({ owner: localPlayer.UserId, id: `PlayerCharacter_${localPlayer.UserId}` }),
			);

			this.entity = entity;

			this.cameraController.setFirstPerson(character);
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
			this.updateCharacter(this.character);

			if (currentState === this.characterState) break;
			currentState = this.characterState;
		}
	}

	private setupControls(): void {
		this.inputBuffer = {
			jump: false,
			sprint: false,
		};

		let jumpThread: thread | undefined;
		this.characterJanitor.Add(
			UserInputService.InputBegan.Connect((input) => {
				const character = this.character;
				if (character === undefined) return;

				if (input.KeyCode === Enum.KeyCode.LeftControl) {
					if (this.crouching) {
						this.uncrouch(character);
					} else {
						this.crouch(character);
					}
				} else if (input.KeyCode === Enum.KeyCode.Space) {
					this.inputBuffer.jump = true;
					jumpThread = task.defer(() => {
						task.wait(0.35);
						this.inputBuffer.jump = false;
					});
				} else if (input.KeyCode === Enum.KeyCode.LeftShift) {
					if (this.sprinting) {
						this.stopSprinting(character);
					} else {
						this.startSprinting(character);
					}
				}
			}),
		);

		this.characterJanitor.Add(
			UserInputService.InputEnded.Connect((input) => {
				if (input.KeyCode === Enum.KeyCode.Space) {
					this.inputBuffer.jump = false;
					if (jumpThread !== undefined && coroutine.status(jumpThread) !== "dead") {
						coroutine.close(jumpThread);
					}
				}
			}),
		);
	}

	private updateCharacter(character: Character) {
		// print("CURRENT", this.characterState);
		switch (this.characterState) {
			case ECharacterState.Standing:
			case ECharacterState.Walking: {
				this.updateWalking(character);
				break;
			}
			case ECharacterState.Falling: {
				this.updateFalling(character);
				break;
			}
			case ECharacterState.Jumping: {
				this.updateJumping(character);
				break;
			}
		}
	}

	private setState(state: ECharacterState): void {
		// print("NEW", state);
		this.characterState = state;
		this.stateJanitor.Cleanup();
	}

	private uncrouch(character: Character): void {
		if (!this.crouching) return;

		const hitbox = character.Hitbox;

		this.inputBuffer.jump = false;

		this.updateCollisionFilter();
		const ceiling = this.blockCast(character, Vector3.yAxis.mul(hitbox.Size.X * 1.75));

		if (ceiling === undefined) {
			this.crouching = false;

			hitbox.Size = new Vector3(hitbox.Size.X * 2, hitbox.Size.Y, hitbox.Size.Z);
			character.PivotTo(character.GetPivot().add(Vector3.yAxis.mul(hitbox.Size.X / 4)));
		}
	}
	private crouch(character: Character): void {
		if (this.crouching) return;

		if (this.sprinting) this.stopSprinting(character);

		const hitbox = character.Hitbox;

		this.crouching = true;

		hitbox.Size = new Vector3(hitbox.Size.X / 2, hitbox.Size.Y, hitbox.Size.Z);
		character.PivotTo(character.GetPivot().add(Vector3.yAxis.mul(-hitbox.Size.X)));
	}

	private startSprinting(character: Character): void {
		if (this.crouching) this.uncrouch(character);
		if (this.crouching) return;

		this.sprinting = true;
	}

	private stopSprinting(character: Character): void {
		this.sprinting = false;
	}

	private startWalking(): void {
		this.setState(ECharacterState.Walking);
	}

	private startStanding(): void {
		this.setState(ECharacterState.Standing);
	}

	private updateWalking(character: Character): void {
		const moveDirection = this.getMoveVector();

		const floorRes = this.getFloor(character);

		{
			if (moveDirection.Magnitude < 0.25) {
				this.characterState = ECharacterState.Standing;
			} else {
				this.characterState = ECharacterState.Walking;
			}

			if (floorRes === undefined) {
				this.startFalling(character);
			}

			if (this.inputBuffer.jump && !this.crouching) {
				this.startJumping();
			}
		}
		if (this.characterState !== ECharacterState.Walking && this.characterState !== ECharacterState.Standing) return;

		const hitbox = character.Hitbox;

		this.characterSlopeUpdate(character, hitbox.Velocity);

		const force = moveDirection.mul(this.getMoveSpeed());
		hitbox.Velocity = hitbox.Velocity.Lerp(force, 0.25);
		hitbox.Velocity = vector3PositiveY(hitbox.Velocity);

		const velocity = hitbox.Velocity;
		if (velocity.Magnitude < 0.01) return;

		this.characterLateralMove(character);

		const isOnFloor = this.characterSlopeUpdate(character, velocity);

		if (this.characterState === ECharacterState.Walking && !isOnFloor) {
			this.startFalling(character);
		}
	}

	private startJumping(): void {
		this.setState(ECharacterState.Jumping);

		this.inputBuffer.jump = false;
	}

	private updateJumping(character: Character): void {
		const hitbox = character.Hitbox;

		hitbox.Velocity = hitbox.Velocity.add(Vector3.yAxis.mul(CHARACTER_JUMP_FORCE));
		this.startFalling(character);
	}

	private startFalling(character: Character): void {
		this.setState(ECharacterState.Falling);

		// character.Hitbox.Velocity = Vector3.zero;
	}

	private updateFalling(character: Character): void {
		const hitbox = character.Hitbox;

		const floorRes = this.getFloor(character, -hitbox.Size.X / 2 - 0.1);
		// const realFloorRes = this.getFloorFalling(character);

		// print(realFloorRes)

		{
			if (floorRes !== undefined && hitbox.Velocity.Y <= 0) {
				// print(floorRes.Distance);
				this.characterSlopeUpdate(character, Vector3.zAxis.mul(0.01));
				this.startStanding();
			}
		}
		if (this.characterState !== ECharacterState.Falling) return;

		const moveDirection = this.getMoveVector();

		let velocity = hitbox.Velocity.add(Vector3.yAxis.mul(-useDeltaTime() * CHARACTER_ACCELERATION));
		if (moveDirection.Magnitude > 0) {
			const moveRes = this.fallingBlockCast(character, moveDirection.mul(useDeltaTime() * CHARACTER_AIR_SPEED));
			if (moveRes === undefined) velocity = velocity.add(moveDirection.mul(useDeltaTime() * CHARACTER_AIR_SPEED));
		}

		if (velocity.Magnitude > 1) {
			// velocity = velocity.Unit.mul(math.min(velocity.Magnitude, 16));
		}
		hitbox.Velocity = velocity;

		if (velocity.Magnitude === 0) return;

		const displacement = velocity.mul(useDeltaTime());

		const res = this.fallingBlockCast(
			character,
			displacement.Unit.mul(displacement.Magnitude + CHARACTER_WALL_OFFSET),
		);

		if (res === undefined) {
			character.PivotTo(character.GetPivot().add(displacement));
			return;
		}

		character.PivotTo(character.GetPivot().add(displacement.Unit.mul(res.Distance - CHARACTER_WALL_OFFSET)));
		if (res.Normal.Y > 0) {
			this.startStanding();
			// this.characterSlopeUpdate(character, res.Normal);
			return;
		}

		const normal = res.Normal;

		const lostVelocity = normal.mul(velocity.Dot(normal));
		velocity = velocity.sub(lostVelocity);

		hitbox.Velocity = velocity;

		const displacement2 = velocity.mul(useDeltaTime());
		if (displacement2.Magnitude <= 0) return;

		const prevParent = res.Instance.Parent;
		res.Instance.Parent = undefined;

		const res2 = this.fallingBlockCast(
			character,
			displacement2.Unit.mul(displacement2.Magnitude + CHARACTER_WALL_OFFSET),
		);
		res.Instance.Parent = prevParent;
		if (res2 === undefined) {
			character.PivotTo(character.GetPivot().add(displacement2));
		} else {
			const normal2 = res2.Normal;

			velocity = velocity.sub(normal2.mul(velocity.Dot(normal2)));
			hitbox.Velocity = velocity;
			character.PivotTo(character.GetPivot().add(displacement2.Unit.mul(res2.Distance - CHARACTER_WALL_OFFSET)));
		}

		if (velocity.Y <= 0 && res.Normal.Y > 0) {
			this.startStanding();
		}
	}

	/**
	 * Attempts to keep the character stuck to the ground on slopes.
	 *
	 * Returns whether or not the character has stuck to the ground.
	 */
	private characterSlopeUpdate(character: Character, force: Vector3): boolean {
		const hitbox = character.Hitbox;

		const floorRes = this.getFloorSlopeUpdate(character, -character.Hitbox.Size.X);
		if (floorRes === undefined) {
			return false;
		}

		const floor = floorRes.Instance;
		const normal = floorRes.Normal;

		const angle = math.pi / 2 - force.Angle(normal);
		const escapeForce = this.slopeEscapeForce(angle);

		if (force.Magnitude > escapeForce) {
			return false;
		}

		character.PivotTo(character.GetPivot().add(Vector3.yAxis.mul(-floorRes.Distance + hitbox.Size.X / 2)));
		return true;
	}

	private characterLateralMove(character: Character): void {
		const hitbox = character.Hitbox;

		const displacement = hitbox.Velocity.mul(useDeltaTime());
		if (displacement.Magnitude === 0) return;

		const res = this.blockCast(character, displacement.Unit.mul(displacement.Magnitude + CHARACTER_WALL_OFFSET));
		if (res === undefined) {
			character.PivotTo(character.GetPivot().add(displacement));
			return;
		}

		character.PivotTo(character.GetPivot().add(displacement.Unit.mul(res.Distance - CHARACTER_WALL_OFFSET)));

		const normal = vector3XZ(res.Normal).Unit;

		if (normal !== normal) return;
		const parallel = normal.Cross(Vector3.yAxis);

		const movement = parallel.mul(displacement.Dot(parallel));

		const res2 = this.blockCast(character, movement.Unit.mul(movement.Magnitude + CHARACTER_WALL_OFFSET));
		if (res2 === undefined) {
			character.PivotTo(character.GetPivot().add(movement));

			const vel2D = vector3XZ(hitbox.Velocity);
			hitbox.Velocity = new Vector3(0, hitbox.Velocity.Y).add(parallel.mul(vel2D.Dot(parallel)));
			return;
		}

		hitbox.Velocity = new Vector3(0, hitbox.Velocity.Y);

		// const pos2 = res2.Position;
		// const normal2 = vector3XZ(res2.Normal).Unit;

		// if (normal2 !== normal2) return;
		// const parallel2 = normal2.Cross(Vector3.yAxis);

		// const intersection = lineIntersection(pos, pos.add(parallel), pos2, pos2.add(parallel2));

		// const offset = intersection.sub(
		// 	new Vector3(math.sign(pos.X - intersection.X), 0, math.sign(pos.Z - intersection.Z)).mul(hitbox.Size.Z),
		// );

		// character.PivotTo(character.GetPivot().Rotation.add(offset));
	}

	private slopeEscapeForce(angle: number): number {
		if (angle < 0.001) return math.huge;
		return 50 / math.tan(angle);
	}

	private getFloor(character: Character, distance = -character.Hitbox.Size.X / 1.75): RaycastResult | undefined {
		return this.blockCast(character, Vector3.yAxis.mul(distance));
	}

	private getFloorSlopeUpdate(character: Character, distance: number): RaycastResult | undefined {
		const direction = Vector3.yAxis.mul(distance);

		const hitbox = character.Hitbox;
		const safeOffset = direction.Unit.mul(hitbox.Size.Z / 2);

		this.updateCollisionFilter();
		const res = Workspace.Blockcast(
			hitbox.CFrame.sub(safeOffset),
			hitbox.Size,
			direction.add(safeOffset),
			this.hitboxParams,
		);

		if (res === undefined) return;

		return {
			Distance: math.max(0, res.Distance - safeOffset.Magnitude),
			Instance: res.Instance,
			Material: res.Material,
			Normal: res.Normal,
			Position: res.Position,
		};
	}

	private getFloorFalling(character: Character): RaycastResult | undefined {
		const hitbox = character.Hitbox;
		this.updateCollisionFilter();

		return this.fallingBlockCast(character, Vector3.yAxis.mul(-0.1));
	}

	private blockCast(character: Character, direction: Vector3): RaycastResult | undefined {
		const hitbox = character.Hitbox;
		const safeOffset = direction.Unit.mul(hitbox.Size.Z / 2);

		this.updateCollisionFilter();
		const res = Workspace.Blockcast(
			hitbox.CFrame.sub(safeOffset),
			hitbox.Size,
			direction.add(safeOffset),
			this.hitboxParams,
		);

		if (res === undefined) return;

		return {
			Distance: res.Distance - safeOffset.Magnitude,
			Instance: res.Instance,
			Material: res.Material,
			Normal: res.Normal,
			Position: res.Position,
		};
	}

	private fallingBlockCast(character: Character, direction: Vector3): RaycastResult | undefined {
		const hitbox = character.Hitbox;
		const safeOffset = direction.Unit.mul(hitbox.Size.Z / 2);

		const castCF = hitbox.CFrame.sub(safeOffset).sub(new Vector3(0, hitbox.Size.X / 4));

		this.updateCollisionFilter();
		const res = Workspace.Blockcast(
			castCF,
			hitbox.Size.add(new Vector3(hitbox.Size.X / 2)),
			direction.add(safeOffset),
			this.hitboxParams,
		);

		if (res === undefined) return;

		const targetPos = castCF.Position.add(direction.Unit.mul(res.Distance));
		const hitboxEndPos = targetPos.add(new Vector3(0, hitbox.Size.X / 4));
		const hitboxDist = hitbox.Position.sub(hitboxEndPos).Magnitude;

		return {
			Distance: res.Distance - safeOffset.Magnitude,
			Instance: res.Instance,
			Material: res.Material,
			Normal: res.Normal,
			Position: res.Position,
		};
	}

	private getMoveVector(): Vector3 {
		if (UserInputService.KeyboardEnabled) {
			const move = new Vector3(
				(UserInputService.IsKeyDown(Enum.KeyCode.D) ? 1 : 0) +
					(UserInputService.IsKeyDown(Enum.KeyCode.A) ? -1 : 0),
				0,
				(UserInputService.IsKeyDown(Enum.KeyCode.W) ? -1 : 0) +
					(UserInputService.IsKeyDown(Enum.KeyCode.S) ? 1 : 0),
			);

			const headRelative = getVecXZRelativeCamera(move);

			return headRelative;
		}

		return Vector3.zero;
	}

	private getMoveSpeed(): number {
		return this.crouching ? CHARACTER_CROUCH_SPEED : this.sprinting ? CHARACTER_SPRINT_SPEED : CHARACTER_SPEED;
	}

	private updateCollisionFilter(): void {
		this.hitboxParams.FilterDescendantsInstances = getTagged(ETags.Collision);
		this.hitboxOverlapParams.FilterDescendantsInstances = getTagged(ETags.Collision);
	}

	public makeCharacter(): Character {
		const character = makePrefab("PlayerCharacter");

		character.Hitbox.Transparency = 0.5;

		return character;
	}
}
