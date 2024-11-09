import { World } from "@rbxts/matter";
import { useEventListener, useUpdate } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { createContext } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import Signal from "@rbxts/signal";
import { localPlayer } from "client/util/player";
import { UserInterface } from "shared/components/base/ui";
import { dependency } from "shared/util/matter/start";
import { ClientParams, ClientService } from "types/generic";

export default class UIService implements ClientService {
	/** @hidden */
	public readonly screenGui = new Instance("ScreenGui");

	/** @hidden */
	public readonly triggerRender = new Signal<(world: World) => void>();

	public readonly entityContext = createContext(-1);

	/** @hidden */
	public onInit(world: World, [state]: ClientParams): void {
		this.screenGui.Parent = localPlayer.WaitForChild("PlayerGui");
		this.screenGui.ResetOnSpawn = false;
		this.screenGui.IgnoreGuiInset = true;
		this.screenGui.ClipToDeviceSafeArea = false;
	}

	public onStart(world: World, [state]: ClientParams): void {
		const root = createRoot(localPlayer.WaitForChild("PlayerGui"));
		root.render(<Main world={world} />);
	}

	public onRender(world: World, [state]: ClientParams): void {
		for (const [entity, { old, new: current }] of world.queryChanged(UserInterface)) {
			this.triggerRender.Fire(world);
			break;
		}
	}
}

interface IProps {
	world: World;
}

function Main({ world }: IProps): React.Element {
	const update = useUpdate();

	const EntityProvider = dependency(UIService).entityContext.Provider;

	useEventListener(dependency(UIService).triggerRender, () => {
		update();
	});

	const uis = new Map<number | string, React.Element>();
	for (const [entity, userInterface] of world.query(UserInterface)) {
		uis.set(
			entity,
			<EntityProvider value={entity}>
				<userInterface.element />
			</EntityProvider>,
		);
	}

	return <>{uis}</>;
}
