import { Loop, System, World } from "@rbxts/matter";
import { RunService } from "@rbxts/services";
import { EServicePriority, ServiceBase } from "types/matter/service";

type Service<P extends unknown[] = unknown[]> = ServiceBase<[World, ...P]>;

const serviceList = new Map<Constructor, Service>();

export function dependency<T extends ServiceBase<[World, ...unknown[]]>>(dep: Constructor<T>): T {
	return serviceList.get(dep) as never;
}

export function startMatter<S extends ServiceBase<[World, ...P]>, P extends [...args: unknown[]]>(
	folder: Folder,
	...serviceArgs: P
): [World, Loop<[World, ...P]>] {
	type Params = [World, ...P];

	const services = new Array<System<Params>>();

	const serviceInits = new Array<() => void>();
	const serviceStarts = new Array<() => void>();

	const world = new World();

	for (const module of folder.GetDescendants()) {
		if (!module.IsA("ModuleScript")) continue;

		const { default: object } = require(module) as { default: Constructor<S> };

		const service = new object();
		serviceList.set(object, service);

		if (service.onRender !== undefined) {
			services.push({
				system: (...args: Params) => {
					service.onRender!(...args);
				},
				priority: service.priority ?? EServicePriority.Default,
				event: "PreRender",
			});
		}

		if (service.onPhysics !== undefined) {
			services.push({
				system: (...args: Params) => {
					service.onPhysics!(...args);
				},
				priority: service.priority ?? EServicePriority.Default,
				event: "PreSimulation",
			});
		}

		if (service.onHeartbeat !== undefined) {
			services.push({
				system: (...args: Params) => {
					service.onHeartbeat!(...args);
				},
				priority: service.priority ?? EServicePriority.Default,
				event: "PostSimulation",
			});
		}

		if (service.onInit !== undefined) {
			serviceInits.push(() => service.onInit!(world, ...serviceArgs));
		}

		if (service.onStart !== undefined) {
			serviceInits.push(() => service.onStart!(world, ...serviceArgs));
		}
	}

	serviceInits.forEach((init) => init());
	serviceStarts.forEach((start) => task.spawn(start));

	const loop = new Loop(world, ...serviceArgs);

	loop.scheduleSystems(services);
	loop.begin({
		default: RunService.PostSimulation,
		PreRender: RunService.PreRender,
		PreAnimation: RunService.PreAnimation,
		PreSimulation: RunService.PreSimulation,
		PostSimulation: RunService.PostSimulation,
	});

	return [world, loop];
}
