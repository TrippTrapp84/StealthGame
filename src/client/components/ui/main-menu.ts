import { makeComponent } from "shared/util/matter/component";
import { UserInterface } from "../../../shared/components/base/ui";
import { MainMenuElement } from "client/ui/main-menu";

export interface MainMenu {}

export const MainMenu = makeComponent<MainMenu>("MainMenu");

export function makeMainMenu() {
	return [UserInterface({ element: MainMenuElement }), MainMenu()];
}
