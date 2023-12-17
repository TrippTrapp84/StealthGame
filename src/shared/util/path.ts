import { Janitor } from "@rbxts/janitor";
import { PathfindingService } from "@rbxts/services";

export const enum EPathState {
	NoPath,

	Calculating,

	ValidPath,
}

export class PathInstance {
	private path: Path;

	private status = EPathState.NoPath;

	private janitor = new Janitor();

	constructor(...args: Parameters<PathfindingService["CreatePath"]>) {
		this.path = PathfindingService.CreatePath(...args);
	}

	public async computeAsync(start: Vector3, target: Vector3): Promise<EPathState> {
		this.janitor.Cleanup();

		let res: (state: EPathState) => void;
		const promise = new Promise<EPathState>((resolve) => (res = resolve));

		this.janitor.Add(
			task.spawn(() => {
				this.path.ComputeAsync(start, target);

				const status = this.path.Status;
				if (status === Enum.PathStatus.Success) {
					res(EPathState.ValidPath);
				} else {
					res(EPathState.NoPath);
				}
			}),
		);

        this.janitor.Add(() =>)

		return promise;
	}
}
