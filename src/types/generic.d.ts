import { World } from "@rbxts/matter";
import { ClientState } from "./state/client-state";
import { ServiceBase } from "./matter/service";
import { ServerState } from "./state/server-state";

export type ClientParams = [ClientState];
export type ServerParams = [ServerState];
declare abstract class ClientService extends ServiceBase<[World, ClientParams]> {}
declare abstract class ServerService extends ServiceBase<[World, ServerParams]> {}
