import { Networking } from "@flamework/networking";
import { ReplicatedStorage } from "@rbxts/services";
import { EErrors } from "types/enums/error-types";
import { ILevelData } from "types/interfaces/level";
import { IServerResponse } from "types/interfaces/network-types";

interface ServerEvents {
	replicationChanged(id: string, data: Record<string, unknown>): void;

	/** DEBUG */
	clientLoaded(): void;
}
interface ServerFunctions {
	requestAsset(id: string): IServerResponse<Model, EErrors>;
}

interface ClientEvents {
	characterSpawned(position: Vector3): void;

	levelLoaded(level: ILevelData): void;

	replicationChanged(id: string, data: Record<string, unknown>): void;
	replicationAdded(id: string, data: Record<string, unknown>): void;
	replicationRemoved(id: string, data: Record<string, unknown>): void;

	simpleGuardSpawned(id: string, agent: ModelWithPrimaryPart, config: SimpleGuardConfig): void;
}
interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
