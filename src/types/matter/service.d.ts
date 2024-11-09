import { World } from "@rbxts/matter";

export declare abstract class ServiceBase<T extends [world: World, ...args: unknown[]]> {
	public onInit?(...args: T): void;
	public onStart?(...args: T): void;

	public onRender?(...args: T): void;
	public onPhysics?(...args: T): void;
	public onHeartbeat?(...args: T): void;

	public priority?: EServicePriority;
}

export const enum EServicePriority {
	/** Reserved for most intermediate or middleware systems designed to process inputs at the beginning of frames */
	First = 0,

	Primary = 100,
	Secondary = 200,
	Tertiary = 300,
	Quaternary = 400,

	/** The default priority when a priority is not specified. Runs second to last, only before `EServicePriority.Last` */
	Default = 500,

	/** Reserved for most outbound systems such as replication. It's not recommended to use this */
	Last = 600,
}
