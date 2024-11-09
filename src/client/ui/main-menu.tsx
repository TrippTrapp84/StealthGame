import React from "@rbxts/react";
import { useContext } from "@rbxts/react";
import UIService from "client/services/ui";
import { dependency } from "shared/util/matter/start";

export function MainMenuElement(): React.Element {
	useContext(dependency(UIService).entityContext);
	return (
		<screengui
			ClipToDeviceSafeArea={false}
			IgnoreGuiInset={true}
			ScreenInsets={"None"}
			SafeAreaCompatibility={"None"}
		>
			<frame BackgroundColor3={new Color3()} Size={new UDim2(1, 0, 1, 0)} />
		</screengui>
	);
}
