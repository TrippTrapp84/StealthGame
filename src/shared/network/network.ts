import { Networking } from "@flamework/networking";
import { ReplicatedStorage } from "@rbxts/services";

interface ServerEvents {
	replicationChanged(id: string, data: Record<string, unknown>): void;
}
interface ServerFunctions {}

interface ClientEvents {
	characterSpawned(): void;

	replicationChanged(id: string, data: Record<string, unknown>): void;
	replicationAdded(id: string, data: Record<string, unknown>): void;
	replicationRemoved(id: string, data: Record<string, unknown>): void;
}
interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
